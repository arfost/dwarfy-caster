const net = require('net');

const pjson = require('./proto.json');
{ // HACK: fix illegal messages from RFR
  const flds = pjson.nested['RemoteFortressReader'].nested['MapBlock'].fields
  delete flds['mapX'].rule
  delete flds['mapY'].rule
  delete flds['mapZ'].rule
}
const protobuf = require('protobufjs/light');
const root = protobuf.Root.fromJSON(pjson);

const FUNC_DEFS = [
  // plugin, namespace for new protobuf types, { methods }
  [null, 'dfproto', {
    BindMethod: ['CoreBindRequest', 'CoreBindReply'],
    RunCommand: ['CoreRunCommandRequest', 'EmptyMessage'],
    CoreSuspend: ['EmptyMessage', 'IntMessage'],
    CoreResume: ['EmptyMessage', 'IntMessage'],
    RunLua: ['CoreRunLuaRequest', 'StringListMessage'],
    GetVersion: ['EmptyMessage', 'StringMessage'],
    GetDFVersion: ['EmptyMessage', 'StringMessage'],
    GetWorldInfo: ['EmptyMessage', 'GetWorldInfoOut'],
    ListEnums: ['EmptyMessage', 'ListEnumsOut'],
    ListJobSkills: ['EmptyMessage', 'ListJobSkillsOut'],
    ListMaterials: ['ListMaterialsIn', 'ListMaterialsOut'],
    ListUnits: ['ListUnitsIn', 'ListUnitsOut'],
    ListSquads: ['ListSquadsIn', 'ListSquadsOut'],
    SetUnitLabors: ['SetUnitLaborsIn', 'EmptyMessage']
  }],
  ['rename', 'dfproto', {
    RenameSquad: ['RenameSquadIn', 'EmptyMessage'],
    RenameUnit: ['RenameUnitIn', 'EmptyMessage'],
    RenameBuilding: ['RenameBuildingIn', 'EmptyMessage']
  }],
  ['RemoteFortressReader', 'RemoteFortressReader', {
    GetMaterialList: ['EmptyMessage', 'MaterialList'],
    GetGrowthList: ['EmptyMessage', 'MaterialList'],
    GetBlockList: ['BlockRequest', 'BlockList'],
    CheckHashes: ['EmptyMessage', 'EmptyMessage'],
    GetTiletypeList: ['EmptyMessage', 'TiletypeList'],
    GetPlantList: ['BlockRequest', 'PlantList'],
    GetUnitList: ['EmptyMessage', 'UnitList'],
    GetUnitListInside: ['BlockRequest', 'UnitList'],
    GetViewInfo: ['EmptyMessage', 'ViewInfo'],
    GetMapInfo: ['EmptyMessage', 'MapInfo'],
    ResetMapHashes: ['EmptyMessage', 'EmptyMessage'],
    GetItemList: ['EmptyMessage', 'MaterialList'],
    GetBuildingDefList: ['EmptyMessage', 'BuildingList'],
    GetWorldMap: ['EmptyMessage', 'WorldMap'],
    GetWorldMapNew: ['EmptyMessage', 'WorldMap'],
    GetRegionMaps: ['EmptyMessage', 'RegionMaps'],
    GetRegionMapsNew: ['EmptyMessage', 'RegionMaps'],
    GetCreatureRaws: ['EmptyMessage', 'CreatureRawList'],
    GetPartialCreatureRaws: ['ListRequest', 'CreatureRawList'],
    GetWorldMapCenter: ['EmptyMessage', 'WorldMap'],
    GetPlantRaws: ['EmptyMessage', 'PlantRawList'],
    GetPartialPlantRaws: ['ListRequest', 'PlantRawList'],
    CopyScreen: ['EmptyMessage', 'ScreenCapture'],
    PassKeyboardEvent: ['KeyboardEvent', 'EmptyMessage'],
    SendDigCommand: ['DigCommand', 'EmptyMessage'],
    SetPauseState: ['SingleBool', 'EmptyMessage'],
    GetPauseState: ['EmptyMessage', 'SingleBool'],
    GetVersionInfo: ['EmptyMessage', 'VersionInfo'],
    GetReports: ['EmptyMessage', 'Status'],
    GetLanguage: ['EmptyMessage', 'Language']
  }],
  ['RemoteFortressReader', 'AdventureControl', {
    MoveCommand: ['MoveCommandParams', 'EmptyMessage'],
    JumpCommand: ['MoveCommandParams', 'EmptyMessage'],
    MenuQuery: ['EmptyMessage', 'MenuContents'],
    MovementSelectCommand: ['IntMessage', 'EmptyMessage'],
    MiscMoveCommand: ['MiscMoveParams', 'EmptyMessage']
  }],
  ['isoworldremote', 'isoworldremote', {
    GetEmbarkTile: ['TileRequest', 'EmbarkTile'],
    GetEmbarkInfo: ['MapRequest', 'MapReply'],
    GetRawNames: ['MapRequest', 'RawNames']
  }]
]

/**
 * An unrecoverable error that closes the socket.
 */
class CodecError extends Error { }

/**
 * A recoverable error that rejects the next pending promise.  This
 * corresponds to a decodable error that should be delivered to the
 * higher-level function.
 */
class FramedCodecError extends Error { }


const REQUEST_MAGIC_HDR = Uint8Array.from([68, 70, 72, 97, 99, 107, 63, 10, 1, 0, 0, 0]) // 'DFHack?\n' 1i32
const RESPONSE_MAGIC_HDR = Uint8Array.from([68, 70, 72, 97, 99, 107, 33, 10, 1, 0, 0, 0]) // 'DFHack!\n' 1i32
/**
 * Possible non-function IDs to be found in RPCMessage.header.id
 * @enum
 */
const RPC = {
  REPLY: {
    RESULT: -1,
    FAIL: -2,
    TEXT: -3
  },
  REQUEST: {
    QUIT: -4
  }
}

function DwarfMessage(id, data) {
  this.id = id
  this.data = data
}

/**
 * @param {Array} a
 * @param {Array} b
 * @returns {Boolean}
 */
function arrayEqual(a, b) {
  if (a === b) return true
  if (a == null || b == null) return false
  if (a.length !== b.length) return false
  // could clone & sort arrays
  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false
  }
  return true
}

class DwarfWireCodec {
  /*
   * Protocol described at https://github.com/DFHack/dfhack/blob/develop/library/include/RemoteClient.h
   * Data structures at    https://github.com/DFHack/dfhack/blob/develop/library/include/RemoteClient.h
   * Server networking at  https://github.com/DFHack/dfhack/blob/develop/library/RemoteServer.cpp
   * Some functions at     https://github.com/DFHack/dfhack/blob/develop/plugins/remotefortressreader/remotefortressreader.cpp
   *                       https://github.com/DFHack/dfhack/blob/develop/library/RemoteTools.cpp
   *
   * RPCHandshakeHeader = { magic: [u8; 8], version: i32 == 1 }
   * RPCMessageHeader = { id: i16, (PACK: u16 = 0,) size: i32 }, size <= 64MiB
   * RPCMessage = { header: RPCMessageHeader, body: [u8; header.size] }
   *      RPCReplyResult  = RPCMessage { { RPC.REPLY.RESULT, sizeof(body) }, body }
   *      RPCReplyFail    = RPCMessage { { RPC.REPLY.FAIL, errno }, }
   * RPCReply = { {RPC.REPLY.TEXT, CoreTextNotification}*, RPCReplyResult | RPCReplyFail }
   *
   * Handshake:
   * -> RPCHandshakeHeader { REQUEST_MAGIC, 1 } == REQUEST_MAGIC_HDR
   * <- RPCHandshakeHeader { RESPONSE_MAGIC, 1 } == RESPONSE_MAGIC_HDR
   *
   * -> RPCMessage { { function_id, sizeof(body) }, body }
   * <- RPCReply
   */

  constructor() {
    this.shookHands = false
    // queue of higher-level messages stripped off wire, to be returned later
    this._textMessages = []
  }

  /**
   * @returns {Uint8Array}
   */
  open() { return REQUEST_MAGIC_HDR }

  /**
   * @param {!DwarfMessage} input
   * @returns {!Uint8Array}
   */
  encode(input) {
    const size = new Uint8Array((new Int32Array([input.data.length])).buffer)
    const id = new Uint8Array((new Int16Array([input.id])).buffer)
    const buf = new Uint8Array(8 + input.data.length)
    buf.set(id, 0)
    buf.set(size, 4)
    buf.set(input.data, 8)
    return buf
  }

  /**
   * Attempts to decode a frame from the provided buffer of bytes.
   * Returns Result<Option<Item>, Error>.
   * Rust invokes .split_to() on buffer, returning first half.
   * @param {{0: !Uint8Array}} buf
   * @returns {?Array<!DwarfMessage>}
   */
  decode(buf) {
    if (!this.shookHands) {
      if (buf[0].length >= 12) {
        if (arrayEqual(buf[0].slice(0, 8), RESPONSE_MAGIC_HDR.slice(0, 8))) {
          console.info('DwarfWireCodec shook hands!')
          this.shookHands = true
          // split_to 12:
          buf[0] = buf[0].slice(12)
        } else {
          throw new CodecError('Handshake response invalid.')
        }
      } else {
        console.log("no shook hands ?");
        return null
      }
    }
    // this.shookHands ASSUMED true now
    if (buf[0].length >= 8) {
      // FIXME slow
      const id = (new Int16Array(buf[0].slice(0, 2).buffer))[0]
      const size = (new Int32Array(buf[0].slice(4, 8).buffer))[0]

      if (id === RPC.REPLY.FAIL) {
        buf[0] = buf[0].slice(8) // split_to 8
        // FAIL means "size" is really the errno
        const msgData = new Uint8Array(size.buffer)
        const msg = new DwarfMessage(id, msgData)
        return [msg, ...this._textMessages.splice(0)]
      } else if (id === RPC.REPLY.TEXT || id === RPC.REPLY.RESULT) {
        if (size >= 0 && size <= 67108864 /* 2**26 */) {
          if (buf[0].length >= 8 + size) {
            const msgData = buf[0].slice(8, 8 + size)
            // split_to 8 + size:
            buf[0] = buf[0].slice(8 + size)

            // collect TEXT replies until a RESULT|FAIL
            const msg = new DwarfMessage(id, msgData)
            if (id === RPC.REPLY.TEXT) {
              this._textMessages.push(msg)
            } else { // RESULT
              return [msg, ...this._textMessages.splice(0)]
            }
          } // else not ready
        } else {
          throw new CodecError('Invalid size in RFR packet.')
        }
      } else {
        throw new FramedCodecError('Illegal reply ID: ' + id)
      }
    }
    return null;
  }
  // decode_eof

  close() {
    return this.encode(new DwarfMessage(RPC.REQUEST.QUIT, new Uint8Array()))
  }
}

const DataAggregator = class {
  constructor() {
    this._buf = new Uint8Array();
  }

  add(data, codec) {
    let text
    if (this._buf.length) {
      const newbuf = new Uint8Array(this._buf.length + data.byteLength)
      newbuf.set(this._buf)
      newbuf.set(new Uint8Array(data), this._buf.length)
      text = newbuf
    } else {
      text = new Uint8Array(data)
    }
    /** @type {{0: !Uint8Array}} */
    const buf = [text]
    let prevLen
    do {
      prevLen = buf[0].length
      let maybeItem
      try {
        maybeItem = codec.decode(buf)
      } catch (e) {
        return { 
          finished: true,
          error: e 
        };
      }

      // NEVER non-null if an exception was thrown
      if (maybeItem != null) {
        // pass DF message
        this._buf = buf[0];
        return { 
          finished: true,
          msg: maybeItem 
        }
        
      } // else, have not received enough data to decode
    } while (prevLen > buf[0].length && buf[0].length) // TODO should use maybeItem != null?

    this._buf = buf[0];
    return { finished: false };
  }

}

const MethodManager = class {

  constructor(funcDefinition) {
    this.funcDefinition = funcDefinition;
    this.methods = {};

    this._initMethods();
  }

  _initMethods() {

    const protoTypes = {};

    for (const [plugin, namespace, methods] of this.funcDefinition) {
      for (const [method, [req, res]] of Object.entries(methods)) {
        if (!protoTypes[req]) {
          protoTypes[req] = {
            qualifier: namespace + '.' + req,
            type: root.lookupType(namespace + '.' + req)
          };
        }
        if (!protoTypes[res]) {
          protoTypes[res] = {
            qualifier:  namespace + '.' + res,
            type: root.lookupType(namespace + '.' + res)
          };
        }
        this.methods[method] = {
          inputName: protoTypes[req].qualifier,
          outputName: protoTypes[res].qualifier,
          inputType: protoTypes[req].type,
          outputType: protoTypes[res].type,
          method,
          plugin,
        }
      }
    }
  }
}


const DfHackConnection = class {

  constructor(target_port, target_host) {

    this.methodManager = new MethodManager(FUNC_DEFS);
    this.codec = new DwarfWireCodec();
    this.aggregator = new DataAggregator();
    this._data = new Uint8Array();
    this.subscribers = [];

    const protoConnection = net.createConnection(target_host, target_port);

    protoConnection.on('end', function () {
      console.log('target disconnected');
    });
    protoConnection.on('error', function (err) {
      console.log('target connection error', err);
      protoConnection.end();
    });

    this.protoConnection = protoConnection;
    console.log("init connection");
    const handshake = this.codec.open();

    this._ready = new Promise((resolve, reject) => {
      this.protoConnection.write(handshake);
      this.protoConnection.on('data', (data) => {
        try{
          this.codec.decode([data]);
          this.protoConnection.removeAllListeners('data');
          this.protoConnection.on('data', this._receive.bind(this));
          console.log("connection ready");
          resolve(true);
        }catch(e){
          console.log("error decode : ", e);
          reject();
        }
      });
    });
  }

  get ready() {
    return this._ready;
  }

  async _prepareRoundTrip(msg) {
    return new Promise((resolve, reject) => {
      this.subscribers.push({ resolve, reject });
      this.protoConnection.write(msg);
    });
  }



  _receive(data) {
    if (!this.subscribers.length) {
      console.log("data received with no subscriber !!!");
      return;
    }
    //decode data
    const { msg, error, finished } = this.aggregator.add(data, this.codec);

    if(finished){
      const subscriber = this.subscribers.shift();
      if (error) {
        subscriber.reject(error);
        return;
      }
      subscriber.resolve(msg);
    }
  }

  async _bindMethod(methodInfos) {
    const inputType = this.methodManager.methods["BindMethod"].inputType;
    const params = {
      method: methodInfos.method, 
      inputMsg: methodInfos.inputName, 
      outputMsg: methodInfos.outputName, 
      plugin: methodInfos.plugin
    }
    const req = inputType.encode(inputType.create(params)).finish();
    const msg = new DwarfMessage(0, req);
    //console.log(`Binding method ${methodInfos.method}, ${methodInfos.inputName}, ${methodInfos.outputName}, ${methodInfos.plugin}`)
    const retour = await this._prepareRoundTrip(this.codec.encode(msg));
    if(retour[0].id === RPC.REPLY.FAIL){
      console.log(Buffer.from(retour[1].data.buffer).toString(), params);
      throw new Error("Error binding method");
    }else{
      const outputType = this.methodManager.methods["BindMethod"].outputType;
      const decodedRetour = outputType.toObject(outputType.decode(retour[0].data));
      return decodedRetour.assignedId;
    }
  }

  async request(method, input = {}) {
    //encode data
    if(!this.methodManager.methods[method]){
      console.log("Method not found", method);
      throw new Error("Method not found : "+method);
    }
    if (!this.methodManager.methods[method].id) {
      const id = await this._bindMethod(this.methodManager.methods[method]);
      this.methodManager.methods[method].id = id;
    }
    const methodId = this.methodManager.methods[method].id;
    const inputType = this.methodManager.methods[method].inputType;
    const req = inputType.encode(inputType.create(input)).finish();
    const msg = new DwarfMessage(methodId, req);

    const retour = await this._prepareRoundTrip(this.codec.encode(msg));

    if(retour[0].id === RPC.REPLY.FAIL){
      console.log("Error sending method", method, input, Buffer.from(retour[1].data.buffer).toString());
      throw new Error("Error sending method");
    }else{
      const outputType = this.methodManager.methods[method].outputType;
      const decodedRetour = outputType.toObject(outputType.decode(retour[0].data));
      return decodedRetour;
    }
      
  }
}

module.exports = { DfHackConnection };