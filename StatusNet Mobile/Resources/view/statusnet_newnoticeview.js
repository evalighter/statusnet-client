/**
 * StatusNet Mobile
 *
 * Copyright 2010 StatusNet, Inc.
 * Based in part on Tweetanium
 * Copyright 2008-2009 Kevin Whinnery and Appcelerator, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Constructor for new notice view
 */
StatusNet.NewNoticeView = function(data) {
    StatusNet.debug("NewNoticeView constructor");

    this.data = data;
    this.attachment = null;

    var db = StatusNet.getDB();
    this.account = StatusNet.Account.getDefault(db);

    this.close = new StatusNet.Event();
}

/**
 * Initialize the window -- add @-reply text if necessary
 */
StatusNet.NewNoticeView.prototype.init = function() {
    // post a new notice
    StatusNet.debug("NewNoticeView.init");

    StatusNet.debug("NewNoticeView.init A");
    var window = this.window = Titanium.UI.createWindow({
        title: 'New Notice',
        backgroundColor: StatusNet.Platform.dialogBackground()
    });

    StatusNet.debug("NewNoticeView.init B");

    var that = this;
    var data = this.data;

    var noticeTextArea = Titanium.UI.createTextArea({
        top: 0,
        left: 0,
        right: 0,
        height: 160,
        value: '',
        returnKeyType: Titanium.UI.RETURNKEY_SEND
    });
    noticeTextArea.addEventListener('return', function() {
        that.postNotice(noticeTextArea.value);
    });
    StatusNet.debug("NewNoticeView.init C");
    if (data.replyToUsername) {
        noticeTextArea.value = '@' + data.replyToUsername + ' ';
        // set cursor position to after the @
        //$('textarea#notice_textarea').selectRange(
        //    me.replyToUsername.length + 2,
        //    me.replyToUsername.length + 2
        //);
    }
    StatusNet.debug("NewNoticeView.init D");
    window.add(noticeTextArea);
    StatusNet.debug("NewNoticeView.init E");

    var cancelButton = Titanium.UI.createButton({
        title: "Cancel"
    });
    cancelButton.addEventListener('click', function(event) {
        that.window.close();
    });

    var updateButton = Titanium.UI.createButton({
        title: "Update"
    });
    updateButton.addEventListener('click', function(event) {
        that.postNotice(noticeTextArea.value);
    });
    if (StatusNet.Platform.hasNavBar()) {
        window.setLeftNavButton(cancelButton);
        window.setRightNavButton(updateButton);
    } else {
        window.add(cancelButton);
        window.add(updateButton);
    }

    var textLimit = this.account.textLimit;
    StatusNet.debug("NewNoticeView.init I");

    StatusNet.debug("textlimit = " + textLimit);

    var counter = Titanium.UI.createLabel({
        text: textLimit,
        top: 160,
        right: 4,
        width: 'auto',
        height: 'auto'
    });
    window.add(counter);
    StatusNet.debug("NewNoticeView.init J");

    // Note: pressing a key doesn't generate a keypress event on
    // Linux version of Titanium.
    /*
    $('#notice_textarea').bind('keydown', function(event) {
        var len = $('#notice_textarea').val().length;

       // turn char counter red when it goes negative
        if (textLimit - len < 0 && (textLimit - len) + 1 === 0) {
            $('#counter').addClass('negative');
        }

        if (textLimit - len === 0) {
            $('#counter').removeClass('negative');
        }

        $('#counter').html(textLimit - len);
    });
    */

    var moreButton = Titanium.UI.createButton({
        title: 'More...',
        top: 162,
        left: 4,
        width: 80, //'auto',
        height: 32 //'auto'
    });
    moreButton.addEventListener('click', function() {
        noticeTextArea.blur();
    });
    window.add(moreButton);

    var moreStuff = Titanium.UI.createView({
        left: 0,
        right: 0,
        top: 200,
        bottom: 0,
        backgroundColor: StatusNet.Platform.dialogBackground(),
        layout: 'vertical'
    });
    window.add(moreStuff);

    // Titanium.Media.isCameraSupported is documented as being a function,
    // but it appears to be an int-bool property.
    if (Titanium.Media.isCameraSupported) {
        var cameraButton = Titanium.UI.createButton({
            title: 'Take photo',
            top: 4,
            left: 4,
            right: 4,
            height: 32
        });
        cameraButton.addEventListener('click', function() {
            Titanium.Media.showCamera({
                success: function(event) {
                    that.addAttachment(event);
                },
                autohide: true,
                animated: true,
                saveToPhotoGallery: true,
                allowEditing: true
            });
        });
        moreStuff.add(cameraButton);
    }

    var galleryButton = Titanium.UI.createButton({
        title: 'Existing photo',
        top: 4,
        left: 4,
        right: 4,
        height: 32
    });
    galleryButton.addEventListener('click', function() {
        StatusNet.debug('WTF');
        Titanium.Media.openPhotoGallery({
            success: function(event) {
                StatusNet.debug('WTF-amazing');
                that.addAttachment(event);
            },
            autohide: true,
            animated: true,
            allowEditing: true
        });
        StatusNet.debug('WTF2');
    });
    moreStuff.add(galleryButton);

    window.addEventListener('open', function(event) {
        // set focus to the text entry field
        noticeTextArea.focus();
    });
    window.addEventListener('close', function(event) {
        StatusNet.debug("Firing close event!");
        that.close.notify();
        StatusNet.debug("Firing close event! DONE");
    });
    window.open({
        modal: true
    });

    StatusNet.debug("NewNoticeView.init END");
};

StatusNet.NewNoticeView.prototype.addAttachment = function(event) {
    var image = event.media; // What is this exactly, a blob?
    for (var x in event) {
        if (event.hasOwnProperty(x)) {
            StatusNet.debug('Camera event.' + x + ' : ' + typeof event[x]);
        }
    }
    StatusNet.debug('Media type: ' + event.mediaType);
    // @fixme implement attachments ;)

    this.attachment = event.media;
};

/**
 * Setup post parameters and post the notice
 */
StatusNet.NewNoticeView.prototype.postNotice = function(noticeText)
{
    StatusNet.debug("NewNoticeView.postNotice()");

    var that = this;
    var method = 'statuses/update.xml';
    var params = {status: noticeText,
                  source: 'StatusNet Mobile'};

    var data = this.data;

    if (data.replyToId) {
        StatusNet.debug("replyToId = " + data.replyToId);
        params.in_reply_to_status_id = data.replyToId;
    }

    if (this.attachment) {
        params.media = this.attachment;
    }

    StatusNet.debug("Sending these post parameters: " + params);

    this.account.apiPost(method, params,
        function(status, response) {
            var id = $(response).find('status > id').text()
            if (id) {
                StatusNet.debug("Posted notice " + id);
            }
            // play notice posted sound
            that.window.close();
        },
        function(status, response) {
            var msg = $(response).find('error').text();
            if (msg) {
                StatusNet.debug("Error posting notice" + " - " + msg);
            } else {
                StatusNet.debug("Error posting notice - " + status + " - " + response);
            }
            that.window.close();
        }
    );
}
