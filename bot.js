// Created by ByteScout, Copyright 2016,
// https://bytescout.com/blog/

var config = require('./config'); // rename config.js.example into config.js and set keys and tokens inside it
var zlib = require('zlib');
var fs = require('fs');
var request = require('request');

// Create bot and add dialogs
var builder = require('botbuilder');
var bot = new builder.BotConnectorBot({ appId: config.AppId, appSecret: config.AppSecret });

bot.add('/', function (session) {
    if(session.message.type !== "Message")
        return;
    var messageText = session.message.text;

    if (messageText.indexOf('hi') === 0 || messageText.indexOf('/start') === 0) {        
        CommandStart(session);
        return;
    }

    if(messageText.indexOf('/') === 0){
        session.message.text = messageText.substr(('/').length)
    }

    if (messageText.indexOf('barcoderead') === 0) {
        CommandBarcodeRead(session);
        return;
    }

    if (messageText.indexOf('barcode') === 0) {
        CommandBarcodeGenerator(session);
        return;
    }

    if (messageText.indexOf('htmltopdf') === 0) {
        CommandHTMLToPDF(session);
        return;
    }

    if (messageText.indexOf('pdftoxml') === 0) {
        CommandPDFToXML(session);
        return;
    }

    if (messageText.indexOf('pdftotext') === 0) {
        CommandPDFToText(session);
        return;
    }

    if (messageText.indexOf('pdftocsv') === 0) {
        CommandPDFToCSV(session);
        return;
    }

    if (messageText.indexOf('pdfinfo') === 0) {
        CommandPDFInfo(session);
        return;
    }

    if (messageText.indexOf('spreadtocsv') === 0) {
        CommandSpreadToCSV(session);
        return;
    }


    if (messageText.indexOf('spreadtotxt') === 0) {
        CommandSpreadToTXT(session);
        return;
    }

    CommandBarcodeGenerator(session);
});


var CommandStart = function (session) {
    var message = config.WelcomeMessage + "\r\n" + CommandShowCommands();
    session.send(message);
};

var CommandShowCommands = function(){
    var message = "ByteScout Bot Commands:\r\n"+ 
    '\u27a1' + "<value> - will generate QR Code for value\r\n" +
    '\u27a1' + "barcode <value> or <type of Barcode>:<value> - will generate barcode\r\n"+
    '\u27a1' + "barcoderead <url to image> - will read barcode\r\n"+
    '\u27a1' + "htmltopdf <inputurl> - will convert to pdf\r\n" + 
    '\u27a1' + "pdftoxml <url to pdf> - will convert pdf to xml\r\n" + 
    '\u27a1' + "pdftotext <url to pdf> - will convert pdf to text\r\n" + 
    '\u27a1' + "pdftocsv <url to pdf> - will convert pdf to csv\r\n" + 
    '\u27a1' + "pdfinfo <url to pdf> - will show pdf infor\r\n" + 
    '\u27a1' + "spreadtocsv <url to spreadsheet> - will convert xls/xlsx to csv\r\n" + 
    '\u27a1' + "spreadtotxt <url to spreadsheet> - will convert xls/xlsx to text\r\n";
    return message;
}

var HandleResponseError = function(session, response){
    console.log(response);
    switch (response.statusCode) {
        case 400:
            var body = JSON.parse(response.body);
            session.send(config.ErrorInput + "\r\n" + body.errors.join("\r\n") +"\r\n\r\n"+ CommandShowCommands());
            break;
        case 500:
            session.send(config.ErrorResponse+"\r\n\r\n"+ CommandShowCommands());
            break;
        default:
            break;    
    }
};

// send success hint
var SuccessHint = function () {
    return "\r\n" + config.SuccessMessage + "\r\n";
};

var CommandBarcodeGenerator = function (session) {
    var text = session.message.text;
    if(text.indexOf('barcode') === 0)
        text = text.substr(('barcode').length);

    var barcodeType = 'qrcode';
    var value = '';

    if (text.indexOf(':') > -1 && !(text.indexOf('http') === 0)) {
        var keys = text.split(':');
        barcodeType = keys.shift();
        value = keys.join(':');
    } else {
        value = text;
    }

    var requestData =
    {
        url: 'https://bytescout.io/api/v1/barcode/generate',
        encoding: 'binary',
        qs: {
            'apikey': config.ByteScoutAPIKEY,
            'properties.symbology': barcodeType.trim(),
            'input': value.trim(),
            'inputType': 'value',
            'outputType': 'link'
        }
    };

    request.get(requestData, function (error, response, body) {
        if (error || response.statusCode != 200) {
            HandleResponseError(session, response);
        } else {
            session.send(SuccessHint() + body);
        }
    });
};

var CommandBarcodeRead = function (session) {
    var text = session.message.text;
    if(text.indexOf('barcoderead') === 0)
        text = text.substr(('barcoderead').length);

    var requestData =
    {
        url: 'https://bytescout.io/api/v1/barcodereader/read',
        encoding: 'binary',
        qs: {
            'apikey': config.ByteScoutAPIKEY,
            'input': text.trim(),
            'inputType': 'link',
            'outputType': 'link'
        }
    };


    request.get(requestData, function (error, response, body) {
        if (error || response.statusCode != 200) {
            HandleResponseError(session, response);
        } else {
            session.send(SuccessHint() + body);
        }
    });
};

var CommandHTMLToPDF = function (session) {
    var text = session.message.text;
    if(text.indexOf('htmltopdf') === 0)
        text = text.substr(('htmltopdf').length);

    var requestData =
    {
        url: 'https://bytescout.io/api/v1/htmltopdf/convert',
        encoding: 'binary',
        qs: {
            'apikey': config.ByteScoutAPIKEY,
            'input': text.trim(),
            'inputType': 'link',
            'outputType': 'link',
            'properties.FooterText': config.HTMLtoPDFHeaderText
        }
    };


    request.get(requestData, function (error, response, body) {
        if (error || response.statusCode != 200) {
            HandleResponseError(session, response);
        } else {
            session.send(SuccessHint() + body);
        }
    });
};

var CommandPDFToXML = function (session) {
    var text = session.message.text;
    if(text.indexOf('pdftoxml') === 0)
        text = text.substr(('pdftoxml').length);

    var requestData =
    {
        url: 'https://bytescout.io/api/v1/pdfextractor/xmlextractor/extract',
        encoding: 'binary',
        qs: {
            'apikey': config.ByteScoutAPIKEY,
            'input': text.trim(),
            'inputType': 'link',
            'outputType': 'link',
            'Properties.StartPageIndex': 0,
            'Properties.EndPageIndex': 0
        }
    };


    request.get(requestData, function (error, response, body) {
        if (error || response.statusCode != 200) {
            HandleResponseError(session, response);
        } else {
            session.send(SuccessHint() + body);
        }
    });
};


var CommandPDFToText = function (session) {
    var text = session.message.text;
    if(text.indexOf('pdftotext') === 0)
        text = text.substr(('pdftotext').length);

    var requestData =
    {
        url: 'https://bytescout.io/api/v1/pdfextractor/textextractor/extract',
        encoding: 'binary',
        qs: {
            'apikey': config.ByteScoutAPIKEY,
            'input': text.trim(),
            'inputType': 'link',
            'outputType': 'link',
            'Properties.StartPageIndex': 0,
            'Properties.EndPageIndex': 0
        }
    };

    request.get(requestData, function (error, response, body) {
        if (error || response.statusCode != 200) {
            HandleResponseError(session, response);
        } else {
            session.send(SuccessHint() + body);
        }
    });
};

var CommandPDFToCSV = function (session) {
    var text = session.message.text;
    if(text.indexOf('pdftocsv') === 0)
        text = text.substr(('pdftocsv').length);

    var requestData =
    {
        url: 'https://bytescout.io/api/v1/pdfextractor/csvextractor/extract',
        encoding: 'binary',
        qs: {
            'apikey': config.ByteScoutAPIKEY,
            'input': text.trim(),
            'inputType': 'link',
            'outputType': 'link',
            'Properties.StartPageIndex': 0,
            'Properties.EndPageIndex': 0
        }
    };

    request.get(requestData, function (error, response, body) {
        if (error || response.statusCode != 200) {
            HandleResponseError(session, response);
        } else {
            session.send(SuccessHint() + body);
        }
    });
};

var CommandPDFInfo = function (session) {
    var text = session.message.text;
    if(text.indexOf('pdfinfo') === 0)
        text = text.substr(('pdfinfo').length);

    var requestData =
    {
        url: 'https://bytescout.io/api/v1/pdfextractor/infoextractor/extract',
        encoding: 'binary',
        qs: {
            'apikey': config.ByteScoutAPIKEY,
            'input': text.trim(),
            'outputType': 'link',
            'inputType': 'link',
        }
    };

    request.get(requestData, function (error, response, body) {
        if (error || response.statusCode != 200) {
            HandleResponseError(session, response);
        } else {
            session.send(SuccessHint() + body);
        }
    });
};

var CommandSpreadToCSV = function (session) {
    var text = session.message.text;
    if(text.indexOf('spreadtocsv') === 0)
        text = text.substr(('spreadtocsv').length);

    var requestData =
    {
        url: 'https://bytescout.io/api/v1/spreadsheet/convert',
        encoding: 'binary',
        qs: {
            'apikey': config.ByteScoutAPIKEY,
            'input': text.trim(),
            'outputType': 'link',
            'inputType': 'link',
            'Properties.ConvertType': 'csv'
        }
    };

    request.get(requestData, function (error, response, body) {
        if (error || response.statusCode != 200) {
            HandleResponseError(session, response);
        } else {
            session.send(SuccessHint() + body);
        }
    });
};

var CommandSpreadToTXT = function (session) {
    var text = session.message.text;
    if(text.indexOf('spreadtotxt') === 0)
        text = text.substr(('spreadtotxt').length);

    var requestData =
    {
        url: 'https://bytescout.io/api/v1/spreadsheet/convert',
        encoding: 'binary',
        qs: {
            'apikey': config.ByteScoutAPIKEY,
            'input': text.trim(),
            'inputType': 'link',
            'outputType': 'link',
            'Properties.ConvertType': 'txt'
        }
    };

    request.get(requestData, function (error, response, body) {
        if (error || response.statusCode != 200) {
            HandleResponseError(session, response);
        } else {
            session.send(SuccessHint() + body);
        }
    });
};

module.exports = bot;

