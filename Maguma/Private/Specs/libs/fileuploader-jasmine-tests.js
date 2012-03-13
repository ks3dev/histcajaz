/// <reference path="../../../Public/JavaScript/External/jquery-1.7.1.js" />
/// <reference path="../../../Public/JavaScript/External/fileuploader.js" />

var cl = function (d) {
    console.log(d);
};
var clp = function (prefix, d) {
    cl(prefix + ' -> ' + d);
};

var dd = dd || {};
var isChromeOrFirefox = (/chrome/.test(navigator.userAgent.toLowerCase()) || $.browser.mozilla);

describe("A core set of unit tests on the Valum file-uploader library, setting as a basepoint how it is expected to operate", function () {
    //return;
    var uploader,
        templateFromFileUploader,
        ongoingUploads,
        externalList,
        BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder;

    beforeEach(function () {

        $("body").append(
            $('<div id="temp-elements">')
                .append(
                    $('<div id="dialog" title="Basic dialog">')
                    .append($('<div id="file-uploader"></div>'))
                )
        );

        ongoingUploads = $('<div id="on-going-uploads">-On Going-</div>').append('<ul>');
        $("body").append(ongoingUploads);

        templateFromFileUploader =
            '<div class="qq-uploader">' +
            '<div class="qq-upload-drop-area"><span>Drop files here to upload</span></div>' +
            '<div class="qq-upload-button">Upload a file</div>' +
            '<ul id="qq-upload-list" class="qq-upload-list"></ul>' +
            '</div>';

        uploader = new qq.FileUploader({
            element: $('#file-uploader')[0],
            jqElementId: 'file-uploader',
            jqExternalElementId: 'on-going-uploads',
            action: '/upload/UploadFile',
            debug: true
        });
    });

    afterEach(function () {
        $("#temp-elements").empty();
        $("#on-going-uploads").remove();
    });

    it("should have created a new uploader", function () {
        //testing the beforeEach setup is correct
        expect(uploader).toBeDefined();
    });

    it("should create the correct handler based on browser when FileUploaderBasic._createUploadHandler is called", function () {

        var basic = new qq.FileUploaderBasic(),
            handler = basic._createUploadHandler();

        if (isChromeOrFirefox) {
            expect(handler.getLoaded).toBeDefined();
            expect(handler._getIframeContentJSON).toBeUndefined();
        } else {
            expect(handler.getLoaded).toBeUndefined();
            expect(handler._getIframeContentJSON).toBeDefined();
        }
    });

    it("should strip out any illegal characters from the file name when FileUploaderBasic._validateFile is called", function () {

        var pretendFile = {}, result;
        pretendFile.value = 'file\\with\\a\\path\\file.name';

        result = uploader._validateFile(pretendFile);

        expect(result).toBeTruthy();
    });

    it("should return false on an invalid extension when FileUploaderBasic._validateFile is called", function () {

        var pretendFile = {}, result;

        pretendFile.value = 'file\\with\\a\\path\\file.name';
        uploader._options.allowedExtensions = ['.jpg', '.gif'];

        result = uploader._validateFile(pretendFile);
        expect(result).toBeFalsy();
    });

    it("should return true on an valid extension when FileUploaderBasic._validateFile is called", function () {

        var pretendFile = {}, result;

        pretendFile.fileName = 'file.gif';
        uploader._options.allowedExtensions = ['jpg', 'gif'];

        result = uploader._validateFile(pretendFile);
        expect(result).toBeTruthy();
    });

    it("should report size is zero when FileUploaderBasic._validateFile is called", function () {

        var pretendFile = {}, result;

        pretendFile.fileName = 'file.jpg';
        pretendFile.size = 0;

        result = uploader._validateFile(pretendFile);
        expect(result).toBeFalsy();
    });

    it("should report size exceeds sizeLimit when FileUploaderBasic._validateFile is called", function () {

        var pretendFile = {}, result;
        uploader._options.sizeLimit = 1024;
        pretendFile.fileName = 'file.jpg';
        pretendFile.size = 1025;

        result = uploader._validateFile(pretendFile);
        expect(result).toBeFalsy();
    });

    it("should allow a file that's below the sizeLimit limit when FileUploaderBasic._validateFile is called", function () {

        var pretendFile = {}, result;
        uploader._options.sizeLimit = 1024;
        pretendFile.fileName = 'file.jpg';
        pretendFile.size = 1024;

        result = uploader._validateFile(pretendFile);
        expect(result).toBeTruthy();
    });

    it("should report size is less than the minSizeLimit when FileUploaderBasic._validateFile is called", function () {

        var pretendFile = {}, result;
        uploader._options.minSizeLimit = 1025;
        pretendFile.fileName = 'file.jpg';
        pretendFile.size = 1024;

        result = uploader._validateFile(pretendFile);
        expect(result).toBeFalsy();
    });

    it("should allow a file that's above the minSizeLimit limit when FileUploaderBasic._validateFile is called", function () {

        var pretendFile = {}, result;
        uploader._options.minSizeLimit = 1024;
        pretendFile.fileName = 'file.jpg';
        pretendFile.size = 1025;

        result = uploader._validateFile(pretendFile);
        expect(result).toBeTruthy();
    });

    /*it("should set up the drag drop area when _setupDragDrop is called", function () {
    //this test can't really work, it is truly dependant on the construction of 'uploader'
    //so resetting the display area, and then only calling _setupDragDrop will only a subset of the correction actions done.

    $("#temp-elements").empty();

    uploader._setupDragDrop();
        
    var dialog = $("#dialog");
    var uploadArea = dialog.find(":qq-uploader");

    expect(dialog.length).toEqual(1);
    expect(uploadArea.length).toEqual(1);
    });*/

    it("should have _preventLeaveInProgress and therefore an attached event when calling _onSubmit", function () {

        var event;
        uploader._onSubmit(1, 'file1.name');

        event = ('onbeforeunload' in window) || ('beforeunload' in window);

        expect(event).toBeTruthy();
    });

    it("should increment the files in progress variable via _onSubmit", function () {
        uploader._onSubmit(1, 'file1.name');

        expect(uploader._filesInProgress).toEqual(1);
    });

    it("should increment the files twice in progress variable via 2 calls to _onSubmit", function () {
        uploader._onSubmit(1, 'file1.name');
        uploader._onSubmit(2, 'file2.name');

        expect(uploader._filesInProgress).toEqual(2);
    });

    it("should create 4 spans, including a spinner when _addToList is called", function () {

        var list, childSpans, spinner;

        uploader._addToList(1, 'file.name');

        list = $('#file-uploader').find(".qq-upload-list");
        childSpans = list.children().find("span");
        spinner = list.children().find(".qq-upload-spinner");

        expect(list.length).toEqual(1);
        expect(childSpans.length).toEqual(4);
        expect(spinner.length).toEqual(1);
    });


    it("should have 3 remaining spans, with the sucess one visible when _onComplete is called with a success result", function () {

        var list, children, childSpans, success, size, failed;
        uploader._addToList(1, 'file.name');
        uploader._onComplete(1, 'file.name', { success: true });

        list = $('#file-uploader').find(".qq-upload-list");
        children = list.children();
        childSpans = children.find("span");
        success = list.find(".qq-upload-success");
        size = list.find(".qq-upload-size");
        failed = list.find(".qq-upload-failed-text");

        expect(list.length).toEqual(1);
        expect(childSpans.length).toEqual(3);
        expect(success.length).toEqual(1);
        expect(size.length).toEqual(1);
        expect(failed.length).toEqual(1);
    });

    it("should show failed correctly, when _onComplete is called with a success = false result", function () {

        var list, failed;
        uploader._addToList(1, 'file.name');
        uploader._onComplete(1, 'file.name', { success: false });

        list = $('#file-uploader').find(".qq-upload-list");
        failed = list.find(".qq-upload-fail");

        expect(failed.length).toEqual(1);
    });

    it("should display 10 percent, 0.1kb file size and a cancel option, on a call to _onProgress", function () {

        var list, size, file, cancel;
        uploader._addToList(1, 'file1.name');
        //deliberate shift of filename, as it isn't used for display/locating element, only id
        uploader._onProgress(1, 'file2.name', 10, 100);

        list = $('#file-uploader').find(".qq-upload-list");
        size = list.find(".qq-upload-size");
        file = list.find(".qq-upload-file");
        cancel = list.find(".qq-upload-cancel");

        expect(file.html()).toEqual('file1.name');
        expect(size.html()).toEqual('10% from 0.1kB');
        expect(cancel.attr('href')).toEqual('#');
        expect(cancel.html()).toEqual('Cancel');
    });

    it("should display only file size when 100% percent progress on a 1MB file, on a call to _onProgress", function () {

        var list, size;
        uploader._addToList(1, 'file1.name');
        //deliberate shift of filename, as it isn't used for display/locating element, only id
        uploader._onProgress(1, 'file2.name', 1000000, 1000000);

        list = $('#file-uploader').find(".qq-upload-list");
        size = list.find(".qq-upload-size");

        expect(size.html()).toEqual('1.0MB');
    });

    it("should display complete file size with Gb suffix, on a call to _onProgress at 100%", function () {

        var list, size;
        uploader._addToList(1, 'file1.name');
        //deliberate shift of filename, as it isn't used for display/locating element, only id
        uploader._onProgress(1, 'file2.name', 1000000000, 1000000000);

        list = $('#file-uploader').find(".qq-upload-list");
        size = list.find(".qq-upload-size");

        expect(size.html()).toEqual('0.9GB');
    });

    it("should set up the visual drag and drop area on the page when created", function () {

        var list = $('#file-uploader').find(":input:file"),
            buttons = $('#file-uploader').find(".qq-upload-button"),
            dropArea = $('#file-uploader').find(".qq-upload-drop-area"),
            dropAreaText = dropArea.children(":first-child");

        expect(list.length).toEqual(1);
        expect(buttons.length).toEqual(1);
        expect(dropArea.length).toEqual(1);
        expect(dropAreaText.html()).toEqual("Drop files here to upload");
    });

    it("should find an item by fileId, when _getItemByFileId is called", function () {

        var item;
        uploader._addToList(1, 'file1.name');
        uploader._addToList(2, 'file2.name');
        uploader._addToList(3, 'file3.name');

        item = uploader._getItemByFileId(2);

        expect(item).toBeDefined();

        expect(item.firstChild.textContent).toEqual('file2.name');
        expect(qq.hasClass(item.firstChild.nextSibling, 'qq-upload-cancel')).toEqual(false);
        //expect(item.find(".qq-upload-file").html()).toEqual('file2.name');
    });

    it("should find an item by fileId, when _getItemByFileId is called", function () {

        var item;
        uploader._addToList(1, 'file1.name');
        uploader._addToList(2, 'file2.name');
        uploader._addToList(3, 'file3.name');

        item = uploader._getItemByFileId(1);

        expect(item).toBeDefined();
        //TODO: _onComplete a file, and track that on complete modified the things...
        expect(item.firstChild.textContent).toEqual('file1.name');
        //expect(item.find(".qq-upload-file").html()).toEqual('file1.name');
    });

    it("should find an item that exists on the initial setup of the uploader controls via the _find method", function () {

        var root = $('#file-uploader')[0], button, drop, list, getSuccess;

        button = uploader._find(root, 'button');
        drop = uploader._find(root, 'drop');
        list = uploader._find(root, 'list');
        getSuccess = function () { uploader._find(root, 'success'); };

        expect(button).toBeDefined();
        expect(drop).toBeDefined();
        expect(list).toBeDefined();
        expect(getSuccess).toThrow(new Error("element not found success"));
    });

    it("should find an items that exist after upload begins _find method", function () {

        var root = $('#file-uploader')[0], spinner, cancel, getSuccess;

        uploader._addToList(1, 'file1.name');
        spinner = uploader._find(root, 'spinner');
        cancel = uploader._find(root, 'cancel');
        getSuccess = function () { uploader._find(root, 'success'); };

        expect(spinner).toBeDefined();
        expect(cancel).toBeDefined();
        expect(getSuccess).toThrow(new Error("element not found success"));
    });

    it("should find an items that exist after upload begins _find method", function () {

        var root = $('#file-uploader')[0], spinner, cancel, getSuccess;

        uploader._addToList(1, 'file1.name');
        spinner = uploader._find(root, 'spinner');
        cancel = uploader._find(root, 'cancel');
        getSuccess = function () { uploader._find(root, 'success'); };

        expect(spinner).toBeDefined();
        expect(cancel).toBeDefined();
        expect(getSuccess).toThrow(new Error("element not found success"));
    });

    it("should find an items that exist after upload completes sucessfully _find method", function () {

        var root = $('#file-uploader')[0], getSpinner, getCancel, success;

        uploader._addToList(1, 'file1.name');
        uploader._onComplete(1, 'file.name', { success: true });

        getSpinner = function () { uploader._find(root, 'spinner'); };
        getCancel = function () { uploader._find(root, 'cancel'); };
        success = uploader._find(root, 'success');

        expect(getSpinner).toThrow(new Error("element not found spinner"));
        expect(getCancel).toThrow(new Error("element not found cancel"));
        expect(success).toBeDefined();
    });

    it("should attach element when qq.attach is called, using attach code taken from _bindCancelEvent", function () {

        var root = $('#file-uploader')[0],
            list = uploader._find(root, 'list');

        qq.attach(list, 'click', function (e) { console.log('unit test - ' + e); });

        expect($('.qq-upload-list').click).toBeDefined();
    });

    it("should test qq.UploadDropZone", function () {

        var dropArea = $('.qq-upload-drop-area').get(0),
            dz = new qq.UploadDropZone({
                element: dropArea
            });

        expect(dz).toBeDefined();
        expect(dz._element).toBeDefined();
        expect(dz._element).toEqual(dropArea);
    });

    it("should have the drop events set up on the dropArea when qq.UploadDropZone._attachEvents is called", function () {

        var dropAreaContent = $(templateFromFileUploader),
            dropArea,
            dz,
            root = $('#file-uploader');

        root.empty();
        root.append(dropAreaContent);
        dropArea = $('.qq-upload-drop-area').get(0);

        dz = new qq.UploadDropZone({
            element: dropArea
        });
        //call it again, in case flow changes, it is called in the creation
        dz._attachEvents();

        expect(('ondragenter' in dropArea)).toBeTruthy();
        expect(('ondragenter' in dropArea)).toBeTruthy();
        expect(('ondragleave' in dropArea)).toBeTruthy();
        expect(('ondrop' in dropArea)).toBeTruthy();
    });

    it("should have the dragover event disabled on the document when qq.UploadDropZone._disableDropOutside is called", function () {

        var dropAreaContent = $(templateFromFileUploader),
            dropArea,
            dz,
            root = $('#file-uploader');

        root.empty();
        root.append(dropAreaContent);
        dropArea = $('.qq-upload-drop-area').get(0);

        dz = new qq.UploadDropZone({
            element: dropArea
        });
        //call it again, in case flow changes, it is called in the creation
        dz._disableDropOutside();

        expect(('ondragover' in document)).toBeTruthy();
        expect(qq.UploadDropZone.dropOutsideDisabled).toBeTruthy();
    });

    it("should succesfully create a new isntance of qq.UploadButton including mapping an existing element", function () {
        var button,
            buttonDiv = $(".qq-upload-button").get(0);

        button = new qq.UploadButton({
            element: buttonDiv,
            multiple: true,
            onChange: function (input) { console.log(input); }
        });

        expect(button).toBeDefined();
        expect(button._element).toEqual(buttonDiv);
    });

    it("should have an item removed from the DOM when qq.remove is called", function () {

        var root = $('#file-uploader');

        qq.remove(root.find(':input').get(0));

        expect(root.find(':input').get(0)).toBeUndefined();
    });

    it("should test qq.UploadButton._createInput styles", function () {

        var root = $('#file-uploader'),
            buttonClass,
            buttonDiv = $(".qq-upload-button").get(0),
            fileInput;

        root.find(':input').remove();

        buttonClass = new qq.UploadButton({
            element: buttonDiv,
            jqElementId: 'file-uploader',
            multiple: true,
            onChange: function (input) { console.log(input); }
        });

        //it was created, but kill it and ensure the _createInput() call can handle it on its own
        root.find(':input').remove();
        //call it again, in case flow changes, it is called in the creation
        buttonClass._createInput();

        //fileInput = uploader._find(buttonDiv, ":input[name=file]"); // 
        fileInput = $('#file-uploader').find(':input');
        expect(fileInput).toBeDefined();
        expect(fileInput.length).toEqual(1);
    });

    it("should test qq.UploadButton._createInput events", function () {

        var root = $('#file-uploader'),
            buttonClass,
            buttonDiv = $(".qq-upload-button").get(0),
            fileInput,
            changeFunc = function (input) { console.log(input); };

        root.find(':input').remove();

        buttonClass = new qq.UploadButton({
            element: buttonDiv,
            multiple: true,
            onChange: changeFunc
        });
        //it was created, but kill it and ensure the _createInput() call can handle it on its own
        root.find(':input').remove();
        //call it again, in case flow changes, it is called in the creation
        buttonClass._createInput();

        fileInput = $('#file-uploader').find(':input');

        expect(fileInput).toBeDefined();
        expect(('change' in fileInput)).toBeTruthy();
        expect(('mouseover' in fileInput)).toBeTruthy();
        expect(('mouseout' in fileInput)).toBeTruthy();
        expect(('focus' in fileInput)).toBeTruthy();
        expect(('blur' in fileInput)).toBeTruthy();
    });

    it("should have an empty queue when UploadHandlerAbstract is called with options", function () {
        //Class for uploading files using form and iframe

        qq.UploadHandlerAbstract({ opts: '' });

        expect(qq._queue).toBeDefined();
        expect(qq._queue.length).toEqual(0);
        //not sure if these are worth checking the existance of:
        expect(qq.UploadHandlerAbstract.prototype.log).toBeDefined();
        expect(qq.UploadHandlerAbstract.prototype.add).toBeDefined();
        expect(qq.UploadHandlerAbstract.prototype.upload).toBeDefined();
        expect(qq.UploadHandlerAbstract.prototype.cancel).toBeDefined();
        expect(qq.UploadHandlerAbstract.prototype.cancelAll).toBeDefined();
    });

    it("should add an upload entry when UploadHandlerAbstract.upload is called", function () {

        var uploadHandler = new qq.UploadHandlerAbstract({ opts: '' });
        uploadHandler.upload(1, { x: 'a-param' });

        expect(uploadHandler._queue.length).toEqual(1);
        //there is always an 'undefined' leading the array
        expect(uploadHandler._params.length).toEqual(2);
        expect(uploadHandler._params[1].x).toEqual('a-param');
    });

    it("should add 3 upload entries when UploadHandlerAbstract.upload is called", function () {

        var uploadHandler = new qq.UploadHandlerAbstract({ opts: '' });

        uploadHandler.upload(1, { x: 'a-param1' });
        uploadHandler.upload(2, { x: 'a-param2' });
        uploadHandler.upload(3, { x: 'a-param3' });

        expect(uploadHandler._queue.length).toEqual(3);
        //there is always an 'undefined' leading the array
        expect(uploadHandler._params.length).toEqual(4);
        expect(uploadHandler._params[1].x).toEqual('a-param1');
        expect(uploadHandler._params[2].x).toEqual('a-param2');
        expect(uploadHandler._params[3].x).toEqual('a-param3');
    });


    it("should remove all 3 queued uploads when UploadHandlerAbstract._dequeue is called 3 times", function () {

        var uploadHandler = new qq.UploadHandlerAbstract({ opts: '' });

        uploadHandler.upload(1, { x: 'a-param1' });
        uploadHandler.upload(2, { x: 'a-param2' });
        uploadHandler.upload(3, { x: 'a-param3' });

        expect(uploadHandler._queue.length).toEqual(3);
        uploadHandler._dequeue(1);
        expect(uploadHandler._queue.length).toEqual(2);
        uploadHandler._dequeue(2);
        expect(uploadHandler._queue.length).toEqual(1);
        uploadHandler._dequeue(3);
        expect(uploadHandler._queue.length).toEqual(0);
    });

    it("should clear all 3 queued uploads when UploadHandlerAbstract.cancel is called 3 times", function () {

        var uploadHandler = new qq.UploadHandlerAbstract({ opts: '' });

        //cancel on abstract calls _cancel which is empty ready to be overridden
        //it also calls _dequeue

        uploadHandler.upload(1, { x: 'a-param1' });
        uploadHandler.upload(2, { x: 'a-param2' });
        uploadHandler.upload(3, { x: 'a-param3' });

        uploadHandler.cancel(1);
        expect(uploadHandler._queue.length).toEqual(2);
        uploadHandler.cancel(2);
        expect(uploadHandler._queue.length).toEqual(1);
        uploadHandler.cancel(3);
        expect(uploadHandler._queue.length).toEqual(0);
    });

    it("should clear the entire queue when UploadHandlerAbstract.cancelAll is called", function () {

        var uploadHandler = new qq.UploadHandlerAbstract({ opts: '' });

        //cancel on abstract calls _cancel which is empty ready to be overridden
        //it also calls _dequeue

        uploadHandler.upload(1, { x: 'a-param1' });
        uploadHandler.upload(2, { x: 'a-param2' });
        uploadHandler.upload(3, { x: 'a-param3' });

        uploadHandler.cancelAll();
        expect(uploadHandler._queue.length).toEqual(0);
        expect(uploadHandler._queue).toEqual([]);
    });

    it("should store and track files added when UploadHandlerForm.add is called", function () {
        var uhf = new qq.UploadHandlerForm({ action: '/upload/UploadFile' }),
            root = $('#file-uploader'),
            input = '<input id="find-me" type="file" />',
            inputElem;

        root.parent().append(input);
        inputElem = $('#find-me').get(0);

        expect(inputElem).toBeDefined();
        uhf.add(inputElem);

        //expect it to be gone, after the add is complete
        expect($('#find-me').get(0)).toBeUndefined();
    });

    it("should create and inject (into DOM) an iframe when UploadHandlerForm._createIframe is called", function () {
        var uhf = new qq.UploadHandlerForm({ action: '/upload/UploadFile' }),
            root = $('#file-uploader'),
            input = '<input id="find-me" type="file" />',
            inputElem,
            iframe,
            id;

        root.parent().append(input);
        inputElem = $('#find-me').get(0);

        id = uhf.add(inputElem);
        iframe = uhf._createIframe(id);

        expect(iframe).toBeDefined();
        expect($('#' + id).get(0)).toBeDefined();
    });

    it("should have inputs defined and begin upload when UploadHandlerForm._upload is called", function () {
        var uhf = new qq.UploadHandlerForm({ action: '/upload/UploadFile' }),
            root = $('#file-uploader'),
            input = '<input id="find-me" type="file" />',
            inputElem,
            id;

        root.parent().append(input);
        inputElem = $('#find-me').get(0);

        id = uhf.add(inputElem);

        uhf._upload(id, {});

        expect(uhf._inputs[id]).toBeDefined();
        expect($('#' + id).get(0)).toBeDefined();
    });


    it("should throw an error on UploadHandlerForm._upload when no input can be found", function () {
        var uhf = new qq.UploadHandlerForm({ action: '/upload/UploadFile' }),
            callUpload = function () {
                uhf._upload('this*does*not*exist&', {});
            };
        expect(callUpload).toThrow(new Error("file with passed id was not added, or already uploaded or cancelled"));
    });

    //[Ignore('This test is proving impossible as the load event cannot be called on the iframe manually')]
    /*it("should be able to call the callback when UploadHandlerForm._attachLoadEvent is called", function () {

    var uhf = new qq.UploadHandlerForm({ }),
    root = $('#file-uploader'),
    input = '<input id="find-me" type="file" />',
    cb = function() {
    root.append('<div id="created-by-callback"></div>');
    return false;
    },
    doc,
    iframe,
    id = "i-frame0",
    //inputElem,
    expectedElement;

    root.parent().append(input);
    //inputElem = $('#find-me').get(0);
    //id = uhf.add(inputElem);
    iframe = uhf._createIframe(id);

    uhf._attachLoadEvent(iframe, cb);
    //$("#i-frame0").trigger('load');

    //Tried many things no luck:
    //$("#i-frame0")[0].load();
    //$("#i-frame0")[0].load.apply()
    //($("#i-frame0").get(0))["load"].call();
    //($("#i-frame0").get(0))["onload"].call();
    //($("#i-frame0").get(0)).load.call();

    iframe = $("#i-frame0").get(0);
    doc = iframe.contentDocument ? iframe.contentDocument : iframe.contentWindow.document;
    doc.body.innerHTML = "{success: true}";

    expectedElement = $('#created-by-callback');
    expect(expectedElement.get(0)).toBeDefined();
    expectedElement.remove();
    });*/

    it("should test that UploadHandlerForm._createIframe is called when a an upload happens", function () {

        var uhf = new qq.UploadHandlerForm({ action: '/upload/UploadFile' }),
            root = $('#file-uploader'),
            input = '<input id="find-me" type="file" />',
            inputElem,
            id;
        root.parent().append(input);
        inputElem = $('#find-me').get(0);

        id = uhf.add(inputElem);

        uhf._upload(id, {});

        expect($('#' + id).get(0)).toBeDefined();
    });

    it("should remove the iframe from the DOM when UploadHandlerForm._cancel is called", function () {

        var uhf = new qq.UploadHandlerForm({ action: '/upload/UploadFile' }),
            root = $('#file-uploader'),
            input = '<input id="find-me" type="file" />',
            inputElem,
            id;

        root.parent().append(input);
        inputElem = $('#find-me').get(0);

        id = uhf.add(inputElem);
        uhf._upload(id, {});

        expect($('#' + id).get(0)).toBeDefined();

        uhf._cancel(id);

        expect($('#' + id).length).toEqual(0);
    });

    it("should be able to execute eval() on the json in an iframe via a call to UploadHandlerForm._getIframeContentJSON", function () {

        var uhf = new qq.UploadHandlerForm({ action: '/upload/UploadFile' }),
            root = $('#file-uploader'),
            input = '<input id="find-me" type="file" />',
            inputElem,
            iframe, id, doc, response;

        root.parent().append(input);
        inputElem = $('#find-me').get(0);

        id = uhf.add(inputElem);

        uhf._upload(id, {});

        iframe = $('#' + id).get(0);
        doc = iframe.contentDocument ? iframe.contentDocument : iframe.contentWindow.document;
        doc.body.innerHTML = "{success: true}";

        response = uhf._getIframeContentJSON(iframe);
        expect(response).toEqual({ success: true });
    });

    it("should test UploadHandlerForm._createForm is called", function () {

        var uhf = new qq.UploadHandlerForm({ action: '/upload/UploadFile' }),
            root = $('#file-uploader'),
            input = '<input id="find-me" type="file" />',
            inputElem,
            iframe, id, form;

        root.parent().append(input);
        inputElem = $('#find-me').get(0);

        id = uhf.add(inputElem);
        uhf._upload(id, {});
        iframe = $('#' + id).get(0);

        //security issues in modern browsers, will have to test this on older IE
        form = uhf._createForm(iframe, {});
        expect(form).toBeDefined();
        expect(form.getAttribute('target')).toEqual(id);
    });

    it("should initialise the storage arrays when a new UploadHandlerXhr is created", function () {

        var xhr = new qq.UploadHandlerXhr({});

        expect(xhr._xhrs).toBeDefined();
        expect(xhr._files).toBeDefined();
        expect(xhr._loaded).toBeDefined();
    });

    it("should test UploadHandlerXhr.isSupported", function () {

        if (!isChromeOrFirefox) {
            return;
        }

        expect(qq.UploadHandlerXhr.isSupported()).toBeTruthy();
    });

    it("should be able to take add a File (or super class Blob) to the _files list when UploadHandlerXhr.add", function () {

        if (!isChromeOrFirefox) {
            return;
        }

        var blob, continueWhenComplete,
            isComplete = false,
            bb = new BlobBuilder(),
            xhr = new window.XMLHttpRequest(),
            uphxhr = new qq.UploadHandlerXhr({}),
            id;

        xhr.open('GET', '/Jasmine/jasmine_favicon.png', true);
        xhr.responseType = 'arraybuffer';

        continueWhenComplete = function () {
            return isComplete;
        };

        xhr.onload = function (e) {
            if (this.status == 200) {
                bb.append(this.response); // Note: not xhr.responseText
                blob = bb.getBlob('image/png');
                isComplete = true;
            }
        };
        xhr.send();

        waitsFor(function () {

            return continueWhenComplete();

        }, "timeout ended", 30000);

        runs(function () {

            id = uphxhr.add(blob);

            expect(uphxhr._files.length).toEqual(1);
            expect(uphxhr._files[id]).toBeDefined();
        });
    });

    it("should be able to return the fileName property on the File object via UploadHandlerXhr.getName", function () {
        if (!isChromeOrFirefox) {
            return;
        }

        var blob,
            bb = new BlobBuilder(),
            xhr = new window.XMLHttpRequest(),
            uphxhr = new qq.UploadHandlerXhr({}),
            resultFileName,
            id;

        xhr.open('GET', '/Jasmine/jasmine_favicon.png', true);
        xhr.responseType = 'arraybuffer';
        bb.append(this.response); // Note: not xhr.responseText
        blob = bb.getBlob('image/png');
        blob.fileName = 'filename.txt';

        id = uphxhr.add(blob);
        resultFileName = uphxhr.getName(id);

        expect(resultFileName).toEqual('filename.txt');
    });

    it("should be able to return the fileSize property on the File object via UploadHandlerXhr.getSize", function () {
        if (!isChromeOrFirefox) {
            return;
        }

        var blob,
            bb = new BlobBuilder(),
            xhr = new window.XMLHttpRequest(),
            uphxhr = new qq.UploadHandlerXhr({}),
            resultFileSize,
            id;

        xhr.open('GET', '/Jasmine/jasmine_favicon.png', true);
        xhr.responseType = 'arraybuffer';
        bb.append(this.response); // Note: not xhr.responseText
        blob = bb.getBlob('image/png');
        blob.fileSize = 10240000;

        id = uphxhr.add(blob);

        resultFileSize = uphxhr.getSize(id);

        expect(resultFileSize).toEqual(10240000);
    });

    it("should upload the file that is fed in via BlobBuild when UploadHandlerXhr._upload is called", function () {

        //NOTE: see below for some important info about getting this test to work
        //      Also that this test will not work as a file:/// specrunner in Chrome or Firefox, it must be run as an application (hosted site)
        if (!isChromeOrFirefox) {
            return;
        }

        var blob,
            bb = new BlobBuilder(),
            xhr = new window.XMLHttpRequest(),
            uphxhr = new qq.UploadHandlerXhr({}),
            id;

        xhr.open('GET', '/Jasmine/jasmine_favicon.png', true);
        xhr.responseType = 'arraybuffer';
        bb.append(this.response); // Note: not xhr.responseText
        blob = bb.getBlob('image/png');

        id = uphxhr.add(blob);
        uphxhr._options.action = '/upload/UploadFile';
        blob.fileName = 'uploadthis' + (new Date()).getTime() + '.png';
        blob.fileSize = 9;
        /*  The below line, exists in _upload, but gets in the way in Chrome during dev, for unit tests
        xhr.setRequestHeader("Access-Control-Allow-Origin: *", "XMLHttpRequest");
        it must be commented out
        */
        uphxhr._upload(id, {});
        expect(uphxhr._files.length).toEqual(1);

        /*
        See these refernces:
        - http://stackoverflow.com/questions/3595515/xmlhttprequest-error-origin-null-is-not-allowed-by-access-control-allow-origin
        - http://stackoverflow.com/questions/4208530/xmlhttprequest-origin-null-is-not-allowed-access-control-access-allow-for-file
        - http://stackoverflow.com/questions/5224017/origin-null-is-not-allowed-by-access-control-allow-origin-in-chrome-why
        */
    });

    it("should return 0 when UploadHandlerXhr.getLoaded is called and there is no entries yet", function () {

        var uphxhr = new qq.UploadHandlerXhr({});

        expect(uphxhr.getLoaded(0)).toEqual(0);
    });

    it("should return the file size of an upload in progress when UploadHandlerXhr.getLoaded is called", function () {

        //NOTE: see below for some important info about getting this test to work
        //      Also that this test will not work as a file:/// specrunner in Chrome or Firefox, it must be run as an application (hosted site)
        if (!isChromeOrFirefox) {
            return;
        }

        var blob,
            bb = new BlobBuilder(),
            xhr = new window.XMLHttpRequest(),
            uphxhr = new qq.UploadHandlerXhr({}),
            id;

        xhr.open('GET', '/Jasmine/jasmine_favicon.png', true);
        xhr.responseType = 'arraybuffer';
        bb.append(this.response); // Note: not xhr.responseText
        blob = bb.getBlob('image/png');

        id = uphxhr.add(blob);
        uphxhr._options.action = '/upload/UploadFile';
        blob.fileName = 'uploadthis' + (new Date()).getTime() + '.png';
        blob.fileSize = 9;
        /*  The below line, exists in _upload, but gets in the way in Chrome during dev, for unit tests
        xhr.setRequestHeader("Access-Control-Allow-Origin: *", "XMLHttpRequest");
        it must be commented out
        */
        uphxhr._upload(0, {});

        expect(uphxhr._files.length).toEqual(1);
        expect(uphxhr.getLoaded(id)).toEqual(0); //logically it should be 9, but since this is a test around current behaviour it's always coming back as 0

        expect(uphxhr._loaded[id]).toEqual(uphxhr.getLoaded(id));
    });

    it("should clear out the current entry when UploadHandlerXhr._onComplete is called", function () {

        //NOTE: see below for some important info about getting this test to work
        //      Also that this test will not work as a file:/// specrunner in Chrome or Firefox, it must be run as an application (hosted site)
        if (!isChromeOrFirefox) {
            return;
        }

        var id = 0,
            bb = new BlobBuilder(),
            xhr = new window.XMLHttpRequest(),
            uphxhr = new qq.UploadHandlerXhr({}),
        //root = $('#file-uploader'),
            onCompleteCb = function (upid, name, response) {
                //root.append('<div id="on-complete-calback">' + upid + name + response + '</div>');
                expect(upid).toEqual(0);
                expect(name).toContain('uploadthis');
                expect(response).toBeDefined();
            },
            onProgressCb = function (upid, name, current, total) {
                //root.append('<div id="on-progress-calback">' + upid + name + current + total + '</div>');
                expect(upid).toEqual(0);
                expect(name).toContain('uploadthis');
                expect(current).toEqual(9);
                expect(total).toEqual(9);
            },
            blob = bb.getBlob('image/png');

        uphxhr.add(blob);
        blob.fileName = 'uploadthis' + (new Date()).getTime() + '.png';
        blob.fileSize = 9;

        uphxhr._options.onComplete = onCompleteCb;
        uphxhr._options.onProgress = onProgressCb;

        xhr.status = 200;
        xhr.responseText = '{success: true}';
        uphxhr._files[id] = blob;
        uphxhr._onComplete(id, xhr);

        expect(uphxhr._files[id]).toEqual(null);
        expect(uphxhr._xhrs[id]).toEqual(null);
        //expect($('#on-complete-calback').get(0)).toBeDefined();
        //tests were moved into the call back to save on creating extra divs and then checking for 'contains'
        //so see expectations in onCompleteCb() and onProgressCb()
    });

    it("should call the onCancel method and clear the files and xhrs item when UploadHandlerXhr._cancel is called", function () {

        var id = 0,
            bb = new BlobBuilder(),
            uphxhr = new qq.UploadHandlerXhr({}),
            onCancelCb = function (upid, name) {
                expect(upid).toEqual(0);
            },
            blob = bb.getBlob('image/png');

        uphxhr._files = {};
        uphxhr._files[id] = blob;

        blob.fileName = 'uploadthis' + (new Date()).getTime() + '.png';
        blob.fileSize = 9;

        uphxhr._options.onCancel = onCancelCb;

        uphxhr._cancel(id);

        expect(uphxhr._files[id]).toEqual(null);
        expect(uphxhr._xhrs[id]).toEqual(null);
    });
});

describe("modifictions (expansion) to the fileuploader lib", function () {
    //return;
    var uploader,
        ongoingUploads,
        externalList,
        templateFromFileUploader,
        BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder;


    //NOTE: This test cannot be active yet, as the fileuploader.js must remain unmodified for now, until enough tests can be created, 
    //the section that defines this in fileuploader.js can be uncommented at that point too

    //need a test for the re-creation re-init of the uploader, the setup of that button
    /*it("should work", function () {
    });*/
    it("should re-setup the drop area and upload button when setupTemplate() is called", function () {

        //clear our the setup as if we're coming back to the same page via ajax, and uploader is not gettin re-created
        $('#file-uploader').empty();

        uploader.setupForReturnToPage($('#file-uploader')[0]);

        var fileInput = $('#file-uploader').find(":input:file");
        var buttons = $('#file-uploader').find(".qq-upload-button");
        var dropArea = $('#file-uploader').find(".qq-upload-drop-area");
        var dropAreaText = dropArea.children(":first-child");

        expect(fileInput.length).toEqual(1);
        expect(buttons.length).toEqual(1);
        expect(dropArea.length).toEqual(1);
        expect(dropAreaText.html()).toEqual("Drop files here to upload");

        expect(buttons.css('position')).toEqual('relative');
        expect(buttons.css('direction')).toEqual('ltr');

        expect(fileInput.css('position')).toEqual('absolute');
        expect(fileInput.css('cursor')).toEqual('pointer');
        expect(fileInput.css('font-size')).toEqual('118px');
    });

    it("should have data-status attribute as 'upload-complete' on upload reporter on success", function () {

        var expected = 'upload-complete',
            list,
            id = 1000;

        uploader._addToList(id, 'file.name');
        uploader._onComplete(id, 'file.name', { success: true });

        list = $('#file-uploader').find("[data-id='" + id + "']");

        expect(list.data('status')).toEqual(expected);
    });

    it("should have data-status attribute as 'upload-failed' on upload reporter on a failure", function () {

        var expected = 'upload-failed',
            list,
            id = 1000;

        uploader._addToList(id, 'file.name');
        uploader._onComplete(id, 'file.name', { success: false });

        list = $('#file-uploader').find("[data-id='" + id + "']");

        expect(list.data('status')).toEqual(expected);
    });

    it("should be able return an item either from standard location, or toast area when _getItemByFileId is called.", function () {
        var id = 1888,
            result,
            children,
            inProgress;

        uploader._addToList(id, 'i.will.have.moved');
        inProgress = $('#file-uploader').find("[data-id='" + id + "']");

        result = uploader._getItemByFileId(id);
        expect(result).toBeDefined();
        expect(inProgress.data('status')).toEqual('in-progress');
        children = qq.children(result);
        expect(children.length).toEqual(5/*4 spans and a link for in progress*/);
    });

    it("should be able relocate an item to a new list when _moveToExtenralList is called.", function () {
        var id = 1900,
            result,
            name = 'i.should.move';

        uploader._addToList(id, name);
        externalList = ongoingUploads.find('ul');

        uploader._moveToExternalList(id, externalList);

        result = $('#on-going-uploads').find("[data-id='" + id + "']");

        expect(result.get(0)).toBeDefined();
        expect(result.find('.qq-upload-file').html()).toEqual(name);
    });

    it("should be able relocate an item to a new list when _moveToExtenralList is called.", function () {
        var id = 1900,
            result,
            name = 'i.should.move';

        uploader._addToList(id, name);

        uploader._moveToExternalList(id);

        result = $('#on-going-uploads').find("[data-id='" + id + "']");

        expect(result.get(0)).toBeDefined();
        expect(result.find('.qq-upload-file').html()).toEqual(name);
    });

    it("should extract only in progress items when FileUploader.extractOutInProgress is called.", function () {
        var id = 1900,
            result,
            name = 'i.should.move';

        uploader._addToList(id, name);

        uploader.extractOutInProgress();

        result = $('#on-going-uploads').find("[data-id='" + id + "']");

        expect(result.get(0)).toBeDefined();
        expect(result.find('.qq-upload-file').html()).toEqual(name);
    });

    beforeEach(function () {

        $("body").append(
            $('<div id="temp-elements">')
                .append(
                    $('<div id="dialog" title="Basic dialog">')
                    .append($('<div id="file-uploader"></div>'))
                )
        );

        ongoingUploads = $('<div id="on-going-uploads">-On Going-</div>').append('<ul>');
        $("body").append(ongoingUploads);

        templateFromFileUploader =
            '<div class="qq-uploader">' +
            '<div class="qq-upload-drop-area"><span>Drop files here to upload</span></div>' +
            '<div class="qq-upload-button">Upload a file</div>' +
            '<ul id="qq-upload-list" class="qq-upload-list"></ul>' +
            '</div>';

        uploader = new qq.FileUploader({
            element: $('#file-uploader')[0],
            jqElementId: 'file-uploader',
            jqExternalElementId: 'on-going-uploads',
            action: '/upload/UploadFile',
            debug: true
        });
    });

    it("should not overwrite progress on items removed from the list (simulated move away)", function () {
        //setup 3 uploads ('in progress')
        if (!isChromeOrFirefox) {
            return;
        }

        var blob,
            amountOfFiles = 6,
            allBlobsGroupOne = [], allBlobsGroupTwo = [],
            bb = new BlobBuilder(),
            xhr = new window.XMLHttpRequest(),
            inProgressGroup1 = [], inProgressGroup2 = [],
            completedGroup = [], result = {},
            g1ids, g2ids;

        xhr.open('GET', '/Jasmine/jasmine_favicon.png', true);
        xhr.responseType = 'arraybuffer';
        bb.append(this.response);

        for (; amountOfFiles > 0; amountOfFiles -= 1) {
            blob = bb.getBlob('image/png');
            blob.fileName = 'file.' + amountOfFiles;
            blob.fileSize = 100000000;
            //split the files into 2 groups
            if ((amountOfFiles % 2) === 0) {
                allBlobsGroupOne.push(blob);
            } else {
                allBlobsGroupTwo.push(blob);
            }
        }

        //just checking on the creation
        expect(allBlobsGroupOne.length).toEqual(3);
        expect(allBlobsGroupTwo.length).toEqual(3);

        g1ids = uploader._uploadFileList(allBlobsGroupOne);
        //move them off
        uploader.extractOutInProgress();

        //expect 3 to have moved
        $('#on-going-uploads').find('li').each(function () {
            if ($(this).data("status") === "in-progress") {
                inProgressGroup1.push($(this));
            }
        });

        expect(inProgressGroup1.length).toEqual(3);

        //start another 3 uploads
        g2ids = uploader._uploadFileList(allBlobsGroupTwo);
        //move them off
        uploader.extractOutInProgress();

        //verify 6 total still in progress
        $('#on-going-uploads').find('li').each(function () {
            if ($(this).data("status") === "in-progress") {
                inProgressGroup2.push($(this));
            }
        });
        expect(inProgressGroup2.length).toEqual(6);

        //mark them all as complete, otherwise they may not complete by the time we get around to checking if they have
        xhr = new window.XMLHttpRequest(),
        xhr.status = 200;
        xhr.responseText = '{success: true}';
        result.error = false;
        result.success = true;
        $.each(g1ids.concat(g2ids), function (indx, val) {
            uploader._onComplete(val, 'file.' + val, result);
        });

        $('#on-going-uploads').find('li').each(function (i, v) {
            //IMPORTANT: do not use .data() here it will not be the most up to date value
            if ($(v).attr("data-status") === "upload-complete") {
                completedGroup.push(v);
            }
        });

        expect(completedGroup.length).toEqual(6);
    });

    it("should be able to cancel items that have move to the alter list (simulated move away) - note test depends on a file existing (that's not included in repo due to size, any .MOV will do)", function () {
        //setup 3 uploads ('in progress')
        if (!isChromeOrFirefox) {
            return;
        }

        var blob, continueWhenComplete, isComplete = false,
            singleUpload = [],
            bb = new BlobBuilder(),
            xhr = new window.XMLHttpRequest(),
            upFileId;

        xhr.open('GET', '/Jasmine/bigfile.mov', true);
        xhr.responseType = 'arraybuffer';

        xhr.send();

        xhr.onload = function (e) {
            if (this.status == 200) {

                bb.append(this.response); // Note: not xhr.responseText
                blob = bb.getBlob('video/x-msvideo');
                blob.fileSize = 183541760;
                blob.fileName = 'bigfile.mov';
                singleUpload = blob;
                isComplete = true;
            }
        };

        //async test setup, and wait
        continueWhenComplete = function () { return isComplete; };
        waitsFor(function () { return continueWhenComplete(); }, "timeout ended", 30000);

        runs(function () {
            cl('intial data fetch done, now lets do stuff');

            upFileId = uploader._uploadFile(singleUpload);

            //just checking on the creation
            expect(singleUpload).toBeDefined();

            //move it off
            uploader.extractOutInProgress();

            //now cancel it
            $('#on-going-uploads').find("[data-id='" + upFileId + "']").find('a').click();
        });
    });

    afterEach(function () {
        $("#temp-elements").empty();
        $("#on-going-uploads").remove();
    });
});

/*
## Extended Features
 - move away concept (navigate away)
      > there is a need to be able to have 1 instance of of the uploader, 
      > so progress can still be tracked as a user moves away from the initial screen
      > many of the below features revolve around supporting this
 - can re-set itself correctly when page navigated away but in scope still attempting via SetupTemplate()
      > Achieved via setupForReturnToPage, and some refactoring to move construction logic into new methods
 - can track status of uploads easier with a data attributed
      > Achieved via the data-status being set via _onComplete()
 - use jQuery instead of pure javascript, then we diverge and can't really support taking new patches from original creators, or sending stuff back to them...
      > Starting, with the introduction of duplicate core variables
      > _jq prefixed elements are jQuery() elems and can be manipulated as such
      > while the rest of the variables can slowly be ported across.
 - after having moved the in-progress elements new uploads do not clobber older ones
      > for now this appears to work simply by ensuring the uploader isn't written over
      > if there is a further need for the entire uploader to be re-seeded then that would be more complex 
      > to achieve this may need to generate unique ids for elements, not just have them be indexes in arrays
 - while in-progress list starts to complete, ensure e
      > to achieve this will need to ensure the update progress can locate items
 - solve the issue in Chrome about the drag div not disappearing, to re-create the issue simply drag over, 
   and don't drop pull it back and the drop area will not vanish
      > resolved this by making use of event.originalEvent.pageX check on the dragleave event, including some upgrades of areas to jQuery
 - introduce the better hover mechanism from the custom one I adjusted
*/


describe("file-upload-in-progress-has-no-after-each-cleanup-task", function () {

    //return; //no new tests in progress

    var uploader,
        ongoingUploads,
        externalList,
        templateFromFileUploader,
        BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder;

    //simply add a return to the top of the above describe block above, 
    //and use this one where less tests will run and no after test event is set up

    it("repair hid div when drop item is pulled back away (not dropped)", function () {
        //this is a mouse event issue, making a unit test would be very difficult
        //Manual test:
        //to re-create the issue simply drag over, and don't drop pull it back and the drop area will not vanish
        expect(true).toBeTruthy();
    });

    //after having moved the in-progress elements new uploads do not clobber older ones

    beforeEach(function () {

        $("body").append(
            $('<div id="temp-elements">')
                .append(
                    $('<div id="dialog" title="Basic dialog">')
                    .append($('<div id="file-uploader"></div>'))
                )
        );

        ongoingUploads = $('<div id="on-going-uploads">-On Going-</div>').append('<ul>');
        $("body").append(ongoingUploads);

        templateFromFileUploader =
            '<div class="qq-uploader">' +
            '<div class="qq-upload-drop-area"><span>Drop files here to upload</span></div>' +
            '<div class="qq-upload-button">Upload a file</div>' +
            '<ul id="qq-upload-list" class="qq-upload-list"></ul>' +
            '</div>';

        uploader = uploaderInProgress = new qq.FileUploader({
            element: $('#file-uploader')[0],
            jqElementId: 'file-uploader',
            jqExternalElementId: 'on-going-uploads',
            action: '/upload/UploadFile',
            debug: false
        });
    });

    //No after each, here in the "in-progress section" so we can debug elements
});

var uploaderInProgress;
function manualAction() {
    //helper for when errors aren't bubbling up from inside the unit tests
    //simply paste some code here, and hit the 'manual action' button on the spec runner page
    cl('nothing defined to run manually');
    var BlobBuilder = window.MozBlobBuilder || window.WebKitBlobBuilder || window.BlobBuilder;
    //--

};
