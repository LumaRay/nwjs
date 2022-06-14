function loadjs(fileName, callBack) {
    var el_script = document.createElement("script");
    el_script.type = "text/javascript";
    el_script.src = fileName;
    el_script.onload = callBack;
    document.body.appendChild(el_script);
}

function LoadOperationFromObject() {
    //_operation = _categories[_categories.length-1];
    var category = _operation.category;
    var subcategory = _operation.subcategory;
    if (_categories[category.name] === undefined) {
        _categories[category.name] = {
            "title": category.title,
            "subcategories": {}
        };
        var el_category_option = document.createElement('option');
        el_category_option.text = category.title.ru;
        el_category_option.value = category.name;
        _el_categories.appendChild(el_category_option);
    }
    if (_categories[category.name].subcategories[subcategory.name] === undefined) {
        _categories[category.name].subcategories[subcategory.name] = {
            "title": subcategory.title,
            "operations": {}
        };
    }
    _categories[category.name]
        .subcategories[subcategory.name]
        .operations[_operation.name] = _operation;
}

function ParseOperationsList() {
    for (var strOperationPath in _OperationsPathList) {
        var opFile = _OperationsPathList[strOperationPath];
        opFile = opFile.trim();
        if (opFile !== '') {
            if (opFile.slice(-3) === '.js') {
                loadjs(opFile, LoadOperationFromObject);
            } else {
                //   var el_operationGroup = document.createElement('optgroup');
                //   el_operationGroup.label = opFile;
                //   _el_operations.appendChild(el_operationGroup);
            }
        }
    }

    _el_categories.addEventListener("change", RenderSubcategoriesList);
    _el_subcategories.addEventListener("change", RenderOperationsList);
    _el_operations.addEventListener("change", RenderOperationForm);
    _el_load_operation.addEventListener("change", onLoadOperation);
    _el_load_operation_zone.addEventListener('dragover', onLoadOperationZoneDragOver, false);
    _el_load_operation_zone.addEventListener('drop', onLoadOperationZoneFileSelect, false);
}

function onLoadOperationZoneFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files;

    onLoadOperation(files);
}

function onLoadOperationZoneDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

function RenderSubcategoriesList() {
    _el_subcategories.innerHTML = "";
    _el_operations.innerHTML = "";
    _el_form.innerHTML = "";
    if (_el_categories.value === "") {
        return;
    }
    var el_subcategory_option = document.createElement('option');
    el_subcategory_option.text = "Выберите подкатегорию...";
    el_subcategory_option.value = "";
    _el_subcategories.appendChild(el_subcategory_option);
    var subcategories = _categories[_el_categories.value].subcategories;
    for (var subcategory_name in subcategories) {
        var subcategory = subcategories[subcategory_name];
        el_subcategory_option = document.createElement('option');
        el_subcategory_option.text = subcategory.title.ru;
        el_subcategory_option.value = subcategory_name;
        _el_subcategories.appendChild(el_subcategory_option);
    }
}

function RenderOperationsList() {
    _el_operations.innerHTML = "";
    _el_form.innerHTML = "";
    if (_el_subcategories.value === "") {
        return;
    }
    var el_operation_option = document.createElement('option');
    el_operation_option.text = "Выберите операцию...";
    el_operation_option.value = "";
    _el_operations.appendChild(el_operation_option);
    var subcategories = _categories[_el_categories.value].subcategories;
    var operations = subcategories[_el_subcategories.value].operations;
    for (var operation_name in operations) {
        var operation = operations[operation_name];
        el_operation_option = document.createElement('option');
        el_operation_option.text = operation.title.ru;
        el_operation_option.value = operation.name;
        _el_operations.appendChild(el_operation_option);
    }
}

function RenderOperationForm() {
    _el_form.innerHTML = "";
    var operation = GetCurrentOperation();
    if (operation === undefined) {
        return;
    }
    for (var f in operation.fields) {
        var f_name = operation.fields[f].name;
        var f_title = operation.fields[f].title.ru;
        var f_type = operation.fields[f].type;
        var f_value = operation.fields[f].value !== undefined ? operation.fields[f].value : "";
        var f_attr = operation.fields[f].attributes;
        var el_label = document.createElement('label');
        el_label.innerText = f_title;
        _el_form.appendChild(el_label);
        _el_form.appendChild(document.createElement('br'));
        var el = null;
        if (f_type === "text") {
            el = document.createElement('input');
            el.type = "text";
            el.value = f_value;
            _el_form.appendChild(el);
            _el_form.appendChild(document.createElement('br'));
        }
        if (f_type === "textarea") {
            el = document.createElement('textarea');
            el.value = f_value;
            //el.type = f_type;
            //el.cols = "45";
            //el.rows = "10";
            _el_form.appendChild(el);
            _el_form.appendChild(document.createElement('br'));
        }
        if (f_type === "file") {
            el = document.createElement('input');
            el.type = "file";
            _el_form.appendChild(el);
            _el_form.appendChild(document.createElement('br'));
            //el.addEventListener("change", onFileInputChanged);

        }
        if (el && f_attr && Array.isArray(f_attr)) {
            for (var a in f_attr) {
                el.setAttribute(f_attr[a].name, f_attr[a].value);
            }
        }
        el.id = el.name = f_name;
    }


    _el_form.appendChild(document.createElement('hr'));

    var el_saveZIP = document.createElement('button');
    el_saveZIP.innerText = "Создать архив";
    _el_form.appendChild(el_saveZIP);
    el_saveZIP.addEventListener("click", SaveOperationFormToZIP);

    // var el_saveJS = document.createElement('button'); 
    // el_saveJS.innerText = "Сохранить как шаблон";   
    // el_form.appendChild(el_saveJS);    
    // el_saveJS.addEventListener("click", SaveOperationFormToJS);

    // var path = window.location.pathname.split('/').splice(0,window.location.pathname.split('/').length-1).join('/') + '/';

    var el_saveOperationTemplate = document.createElement('a');
    el_saveOperationTemplate.href = _el_operations.options[_el_operations.selectedIndex].text + ".js";
    el_saveOperationTemplate.innerText = "Сохранить как шаблон";
    el_saveOperationTemplate.addEventListener("click", function () {
        var operationData = ConvertFormToObject();
        var operationJson = JSON.stringify(operationData, null, 2);
        var operationJS = "_operation = " + operationJson + ";";
        this.href = "data:application/xml;charset=utf-8," + operationJS;
        this.setAttribute("download", operationData.title.ru + ".js");
        return true;
    });
    _el_form.appendChild(el_saveOperationTemplate);

    var el_saveOperationsList = document.createElement('a');
    el_saveOperationsList.href = "list.js";
    el_saveOperationsList.innerText = "Обновить список шаблонов";
    el_saveOperationsList.addEventListener("click", function () {
        var operationData = ConvertFormToObject();
        var operationJson = JSON.stringify(operationData, null, 2);
        var operationJS = "_operation = " + operationJson + ";";
        this.href = "data:application/xml;charset=utf-8," + operationJS;
        this.setAttribute("download", "list.js");
        return true;
    });
    _el_form.appendChild(el_saveOperationsList);

    _el_form.appendChild(document.createElement('hr'));

    // var el_label = document.createElement('label');
    // el_label.innerText = "Загрузить шаблон операции: ";
    // el_form.appendChild(el_label);

    // var el_loadOperationFromJS = document.createElement('input'); 
    // el_loadOperationFromJS.type ="file";
    // el_loadOperationFromJS.addEventListener("change", function(){
    //     alert(this.files[0]);
    // });
    // el_form.appendChild(el_loadOperationFromJS);    


}

// function onFileInputChanged(event) {
//     var tmppath = URL.createObjectURL(event.target.files[0]);    
// }

function GetCurrentOperation() {
    if (_el_categories.value === "" ||
        _el_subcategories.value === "" ||
        _el_operations.value === "") {
        return undefined;
    }
    var subcategories;
    var operations;
    try {
        subcategories = _categories[_el_categories.value].subcategories;
        operations = subcategories[_el_subcategories.value].operations;
    } catch (e) {
        return undefined;
    }
    return operations[_el_operations.value];
}

function ConvertFormToObject() {

    var formData = [];

    var formItem = {};

    _zip = new JSZip();

    for (var e in _el_form.childNodes) {
        var el = _el_form.childNodes[e];
        switch (el.localName) {
            case "label":
                formItem = {};
                //formItem.attributes = new Array();
                formItem.title = {
                    "ru": el.innerText
                };
                break;
            case "input":
                formItem.name = el.id;
                switch (el.type) {
                    case "text":
                        formItem.value = el.value;
                        formItem.type = "text";
                        formData.push(formItem);
                        break;
                    case "file":
                        formItem.type = "file";
                        if (el.getAttribute('multiple') === "") {
                            //formItem.attributes.push({"name": "multiple", "value": ""});
                            formItem.attributes = [{
                                "name": "multiple",
                                "value": ""
                            }];
                        }
                        formItem.value = [];
                        for (var f = 0; f < el.files.length; f++) {
                            var file = el.files[f];
                            formItem.value.push({
                                "name": file.name,
                                "type": file.type,
                                "size": file.size
                            });
                            _zip.file(formItem.name + "/" + file.name, file);
                        }
                        //console.log(formItem);
                        formData.push(formItem);
                        break;
                    default:
                }
                break;
            case "textarea":
                formItem.name = el.id;
                formItem.value = el.value;
                formItem.type = "textarea";
                //console.log(formItem);
                formData.push(formItem);
                break;
            default:
        }
    }

    var operation = GetCurrentOperation();
    // var operationtitle = _el_operations.options[_el_operations.selectedIndex].text;

    var operationData = {
        "version": operation.version,
        "name": _el_operations.value,
        "title": {
            "ru": operation.title.ru
        },
        "category": {
            "name": _el_categories.value,
            "title": {
                "ru": "Заявления"
            }
        },
        "subcategory": {
            "name": _el_subcategories.value,
            "title": {
                "ru": "Прием в члены партии"
            }
        },
        "fields": formData
    };

    return operationData;
}

// function SaveOperationFormToJS() {

//     var operationData = ConvertFormToObject();

//     var operationJson = JSON.stringify(operationData, null, 2);

//     var operationJS = "_operation = " + operationJson + ";";

//     var blob = new Blob([operationJS], {type: "text/plain;charset=utf-8"});
//     //FileSaver.saveAs(blob, "hello world.txt");
//     saveAs(blob, operationData.title.ru+".js");
// }

function buf2hex(buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(
        new Uint8Array(buffer), 
        function(x) { 
            return ('00' + x.toString(16)).slice(-2);
        }
    ).join('');
}

function _base64ToArrayBuffer(base64) {
    var binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}



function GenerateTSA(digest) {

    //var testB64 = "MDkCAQEwMTANBglghkgBZQMEAgEFAAQgmDSHbc+wXLFnpcJJU+uljErImxrfV/KPL50JrxB+6PABAf8=";

    //var testB64 = "MCECAQAwDzAHBgUrDgMCGgQEfwECAwYCKQECBH8BAgMBAf8=";
    
    //<script type="text/javascript" src="js/pkijs/TSP_req_complex_example.js"></script>
    //createTSPReq();
    
    
    
    
    //<script type="text/javascript" src="js/opentimestamps/opentimestamps.min.js"></script>
    //https://opentimestamps.org/docs/javascript-opentimestamps/
    //const OpenTimestamps = require('javascript-opentimestamps');
    //const file = Buffer.from('5468652074696d657374616d70206f6e20746869732066696c6520697320696e636f6d706c6574652c20616e642063616e2062652075706772616465642e0a','hex');
    //const detached = OpenTimestamps.DetachedTimestampFile.fromBytes(new OpenTimestamps.Ops.OpSHA256(), digest);//file);
    var view   = new Int8Array(digest);
    var array =  Array.prototype.slice.call(view);
    const detached = OpenTimestamps.DetachedTimestampFile.fromHash(new OpenTimestamps.Ops.OpSHA256(), array);//file);

    OpenTimestamps.stamp(detached).then( ()=>{
      const fileOts = detached.serializeToBytes();
      console.log(fileOts);
      saveAs(new Blob([fileOts]), "output.ots");
      
        //Verify
        //const file = Buffer.from('5468697320646f63756d656e742069732074696d657374616d706564206f6e20626f7468204c697465636f696e20616e6420426974636f696e20626c6f636b636861696e73','hex');
        //const fileOts = Buffer.from('004f70656e54696d657374616d7073000050726f6f6600bf89e2e884e89294010832bb24ab386bef01c0656944ecafa2dbb1e4162ced385754419467f9fb6f4d97f010c7c118043ce37d45f1ab81d3cd9dc9aa08fff0109b01031328e457c754a860bc5bc567ab08f02012dbcf25d46d7f01c4bd7c7ebdcd2080974b83a9198bc63cdb23f69c817f110508f0203c6274f7a67007de279fb68938e5549f462043570ccdbc17ba43e632a772d43208f1045ab0daf9f008ad9722b721af69e80083dfe30d2ef90c8e292868747470733a2f2f66696e6e65792e63616c656e6461722e657465726e69747977616c6c2e636f6df010dfd289ba718b4f30bb78191936c762a508f02026503e60c641473ec6f833953d04f7c8a65c5059a44a7e8c01c8cb9fed2ac2b308f1045ab0dafaf008c0c7948d8d5b64cf0083dfe30d2ef90c8e232268747470733a2f2f6c74632e63616c656e6461722e636174616c6c6178792e636f6d','hex');
        //const detached = OpenTimestamps.DetachedTimestampFile.fromBytes(new OpenTimestamps.Ops.OpSHA256(), file);
        const detached2 = OpenTimestamps.DetachedTimestampFile.fromHash(new OpenTimestamps.Ops.OpSHA256(), array);//file);
        const detachedOts = OpenTimestamps.DetachedTimestampFile.deserialize(fileOts);
        OpenTimestamps.verify(detachedOts,detached2).then(verifyResult => {
          // return an object containing timestamp and height for every attestation if verified, undefined otherwise.
          console.log(verifyResult);
          // prints:
          // { bitcoin: { timestamp: 1521545768, height: 514371 },
          //   litecoin: { timestamp: 1521540398, height: 1388467 } }
        
        });
    });
    
    
    

    //<script type="text/javascript" src="js/jsrsasign/jsrsasign-all-min.js"></script>
  var json = {
    mi: { hashAlg: "sha256",
          hashValue: "9834876dcfb05cb167a5c24953eba58c4ac89b1adf57f28f2f9d09af107ee8f0" }
  };
  //if (f1.policy1.value != "") 
    //json.policy = {oid: f1.policy1.value};
  //if (f1.nonce1.value != "")
    //json.nonce = {hex: f1.nonce1.value};
  //if (f1.certreq1.checked) {
    json.certreq = true;
  //} else {
    //json.certreq = false;
  //}

    var o = new KJUR.asn1.tsp.TimeStampReq(json);
    var hex = o.getEncodedHex();
    var b64 = hex2b64(hex);
    testB64 = b64;
    //var pemBody = b64.replace(/(.{64})/g, "$1\r\n");
    //pemBody = pemBody.replace(/\r\n$/, '');
    //testB64 = pemBody;


    digest = _base64ToArrayBuffer(testB64);


    var xhr = new XMLHttpRequest();

    xhr.onerror = function(e) {
      console.log(e);
    };
    
    xhr.upload.addEventListener('progress', function(e) {
      //var { loaded, total } = e;
      console.log(e.loaded +  "/" + e.total);
    }, false);
    
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status >= 200 && xhr.status <= 299) {
            //console.log(xhr.responseText);
            //alert(xhr.responseText);
            saveAs(xhr.response, "output.tsr");
          // upload completed
        } else {
            alert(xhr.status);//404 "Not found"
        }
      }
    };
    
    xhr.open('POST', 'https://freetsa.org/tsr', true);
    xhr.setRequestHeader('Content-Type', 'application/timestamp-query');
    xhr.responseType = 'blob';
    xhr.send(digest);
}

function SaveOperationFormToZIP() {

    var operationData = ConvertFormToObject();

    console.log(operationData);

    var operationJson = JSON.stringify(operationData, null, 2);

    _zip.file("operation.json", operationJson);
    //var folderFiles = zip.folder("files");
    //var imgData = "R0lGODdhBQAFAIACAAAAAP/eACwAAAAABQAFAAACCIwPkWerClIBADs=";
    //img.file("smile.gif", imgData, {base64: true});

    // _zip.generateAsync({
    //     type: "blob"
    // })
    // .then(function (content) {
    //     // see FileSaver.js
    //     saveAs(content, operationData.name + ".zip");
    // });

    _zip.generateAsync({
            type: "arraybuffer"
        })
        .then(function (content) {
            var blob = new Blob([new Uint8Array(content)]);
            //saveAs(blob, operationData.name + ".zip");
            window.crypto.subtle.digest("SHA-256", content).then(
                function (digest) {
                    console.log(buf2hex(digest));

                    GenerateTSA(digest);
                },
                function (error) {
                    console.error("Ошибка", error);
                });
        });
}

function UpdateOperationForm(fRenderForm) {
    LoadOperationFromObject();
    if (fRenderForm) {
        _el_categories.value = _operation.category.name;
        RenderSubcategoriesList();
        // setTimeout(function(){
        _el_subcategories.value = _operation.subcategory.name;
        RenderOperationsList();
        // setTimeout(function(){
        _el_operations.value = _operation.name;
        RenderOperationForm();
        // }, 100);
        // }, 100);
    }
}

function onLoadOperation(files) {
    if (files.length === undefined)
        files = _el_load_operation.files;
    for (var f = 0; f < files.length; f++) {
        var file = files[f];
        var fileExt = file.name.split('.').pop();
        if (fileExt === "zip") {
            JSZip.loadAsync(file).then(function (zip) {
                // console.log(zip);
                zip.forEach(function (relativePath, zipEntry) {
                    if (zipEntry.name == "operation.json") {
                        // console.log(zipEntry);
                        zipEntry.async("string")
                            .then(function success(text) {
                                // console.log(text);
                                _operation = JSON.parse(text);
                                UpdateOperationForm(files.length == 1);
                            }, function error(e) {
                                console.error("Ошибка: ", e);
                            });
                    }
                });
            }, function (e) {
                // console.error("Ошибка: ", e);
            });
        } else if (fileExt === "js" || fileExt === "json") {
            // console.log(file);
            var reader = new FileReader();
            reader.onload = function () {
                if (fileExt === "js") {
                    eval(reader.result);
                } else {
                    _operation = JSON.parse(reader.result);
                }
                UpdateOperationForm(files.length == 1);
            };
            reader.readAsText(file);
        }
    }
    //_el_load_operation.value = "";
}