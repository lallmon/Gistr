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


    var CommandManager = brackets.getModule("command/CommandManager"),
        EditorManager  = brackets.getModule("editor/EditorManager"),
        Menus          = brackets.getModule("command/Menus");


    var SUCCESS_MSG = "Gist successfully created at:";
    var ERROR_MSG = "Unable to create gist. Don't ask.";
    var EMPTY_MSG = "Empty selection";
    var GITHUB_API_URL = "https://api.github.com/gists";
    var MY_COMMAND_ID = "togist.toGist";
    var MENU_NAME = "Create Gist";

    var defaultDescription = "Gist created from Brackets";

    
    function handleAction() {
  
        // Retrieve selection
        var selectedText = EditorManager.getFocusedEditor().getSelectedText();

        if (selectedText === "") {
            window.alert(EMPTY_MSG);
            return;
        }

        // Gist description to be sent to github
        var postdata = {
                "description": defaultDescription,
                "public": true,
                "files": {
                    "mycode.js": {
                        "content": selectedText
                    }
                }
            };


        var postdataString = JSON.stringify(postdata);
        

        // Send to github
        $.ajax({
            url: GITHUB_API_URL,
            type: "POST",
            dataType: "json",
            data: postdataString,

            error: function (data) {
                window.alert(ERROR_MSG);
            },

            success: function (data) {
                window.alert(SUCCESS_MSG + "\n" + data.html_url);
                window.open(data.html_url);
            }
        });

    }

    // Register the command and insert in the Edit menu
    CommandManager.register(MENU_NAME, MY_COMMAND_ID, handleAction);
    var menu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    menu.addMenuDivider();
    menu.addMenuItem("menu-edit-toGist", MY_COMMAND_ID);
    
});