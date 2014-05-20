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

    var emptyMessage        = "You'll need to select some text before you can create a Gist.",
        errorMessage        = "Unable to create Gist. :( ",
        errorTitle          = "Error!",
        gistDescription     = "Created with Gistr for Brackets.io",
        gistrLink           = "https://github.com/LucasKA/Gistr",
        githubApiUrl        = "https://api.github.com/gists",
        menuName            = "Create Gist",
        myCommandId         = "lka.gistr",
        successTitle        = "Gist Successfully Created!";
    
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
                "description": gistDescription + " " + gistrLink,
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
                Dialogs.showModalDialog("error-dialog", errorTitle, errorMessage);
            }   ,
            success: function (data) {
                var templateVars = {
                    title: successTitle,
                    data: data.html_url,
                    buttons: [{ className: "primary", id: "ok", text: Strings.OK }, { htmlId: "goToGist", className: "left", id: "ok", text: "Go To Gist" }]
                };
                Dialogs.showModalDialogUsingTemplate(Mustache.render(GistrDialogTemplate, templateVars));
                var $dlg = $('.gistr-dialog.instance');
                //Select the text in the input, so the user can copy to clipboard, which is probably the easiest way, as chrome locks system level clipboard out as a security issue.
                $dlg.find('#gistr-data').select();
                $dlg.find('#goToGist').on('click', function(){
                    brackets.app.openURLInDefaultBrowser(data.html_url);
                });


            }
        });

    }
    // Register the command and insert in the Edit menu
    CommandManager.register(menuName, myCommandId, handleAction);
    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    menu.addMenuDivider();
    menu.addMenuItem(myCommandId);
    var contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU);
    contextMenu.addMenuItem(myCommandId);
    
});
