/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window */

/** Simple extension to create a gist from selection */
define(function (require, exports, module) {
    'use strict';

    var CommandManager      = brackets.getModule("command/CommandManager"),
        Dialogs             = brackets.getModule("widgets/Dialogs"),
        EditorManager       = brackets.getModule("editor/EditorManager"),
        Menus               = brackets.getModule("command/Menus"),
        Strings             = brackets.getModule("strings"),
        GistrDialogTemplate = require("text!gistr-dialog.html");

    var emptyMessage        = "You need to select some text before you can create a Gist.",
        errorMessage        = "Unable to create Gist for some reason.",
        errorTitle          = "Error",
        gistDescription     = "Created with Gister for Brackets.io",
        gistLinkText        = "Go to Gist",
        githubApiUrl        = "https://api.github.com/gists",
        menuName            = "Create Gist",
        myCommandId         = "togist.toGist",
        successTitle        = "Gist Successfully Created!",
        successMessage      = "You can now copy the Gist Location to your Clipboard.\n Or click 'Go to Gist' to open the Gist page in your browser. ";

    
    function handleAction() {
        // Retrieve selection
        var selectedText = EditorManager.getCurrentFullEditor().getSelectedText();
        //Throw an error in a modal if the selection is an empty string.
        if (selectedText === "") {
            Dialogs.showModalDialog("error-dialog", errorTitle, emptyMessage);
            return;
        }
        // Gist description to be sent to github
        var postdata = {
                "description": gistDescription,
                "public": true,
                "files": {
                }
            };
        //You can't use a variable as the key of JSON unless you do this.
        postdata.files[EditorManager.getActiveEditor().document.file.name] = {
                "content": selectedText
            };

        var postdataString = JSON.stringify(postdata);

        // Send to github
        $.ajax({
            url: githubApiUrl,
            type: "POST",
            dataType: "json",
            data: postdataString,

            error: function (data) {
                Dialogs.showModalDialog("error-dialog", errorTitle, errorMessage + data.error);
            },
            success: function (data) {
                var templateVars = {
                    title: successTitle,
                    message: successMessage,
                    linkText: gistLinkText,
                    data: data.html_url,
                    buttons: [{ className: "primary", id: "ok", text: Strings.OK }]
                };
                Dialogs.showModalDialogUsingTemplate(Mustache.render(GistrDialogTemplate, templateVars));
                //Select the text in the input, so the user can copy to clipboard
                //Is there a better place to do this?
                $('#gistr-data').focus(function (){
                    if(this.value == this.defaultValue){
                        this.select();
                    }
                });
              //brackets.app.openURLInDefaultBrowser(data.html_url);
            }
        });

    }
    // Register the command and insert in the Edit menu
    CommandManager.register(menuName, myCommandId, handleAction);
    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    menu.addMenuDivider();
    menu.addMenuItem(myCommandId);
    
});
