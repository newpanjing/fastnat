class ProtocolBuffer {

    constructor(param) {

        //id 8位字符串
        this.id = param.id;

    }


    aa(id, name) {

    }

}

var p = new ProtocolBuffer({
    id: 123
});
p.aa();
console.log(p.id)

