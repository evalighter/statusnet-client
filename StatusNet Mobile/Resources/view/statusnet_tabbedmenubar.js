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

StatusNet.TabbedMenuBar = function() {

    this.tabs = [];
    this.selectedTab = 0;
    this.tabGroup = null;
    this.height = 49;

    this.tabView = Titanium.UI.createView({
        height: 49,
        bottom: 0,
        width: "auto",
        borderRadius: 10
    });
};

StatusNet.createTabbedBar = function(tabInfo, win, client) {

    this.client = client;
    var tb = new StatusNet.TabbedMenuBar();
    var tab;
    var overflow = [];

    var i = 0;

    for (tab in tabInfo) {
        if (tabInfo.hasOwnProperty(tab)) {
            if (i < 4) {
                var minitab = tb.createMiniTab({
                    index: i,
                    deselectedImage: tabInfo[tab].deselectedImage,
                    selectedImage: tabInfo[tab].selectedImage,
                    name: tabInfo[tab].name
                });
                tb.tabs.push(minitab);
                tb.tabView.add(minitab);
                i++;  
            } else {
                overflow.push(tab);
            } 
        }
    }
    
    var moretab = tb.createMiniTab({ 
        index: 4, 
        deselectedImage: 'images/tabs/more.png', 
        selectedImage: 'images/greenbox.png', 
        name: 'more' 
    });
    tb.tabs.push(moretab);
    tb.tabView.add(moretab);
    win.add(tb.tabView);

    return tb;
};

StatusNet.TabbedMenuBar.prototype.setSelectedTab = function(index) {
    this.selectedTab = index;

    var moretab = this.tabs[4];
    
    if (index === 4) {
        StatusNet.debug("MORE MORE MORE!");
        moretab.image = moretab.selectedImage;
    } else {
        moretab.image = moretab.deselectedImage;
    }

    for (var i = 0; i < 4; i++) {
        var minitab = this.tabs[i];
        if (i === index) {
            StatusNet.debug("index = " + index + " name = " + minitab.name);
            minitab.image = minitab.selectedImage;
            StatusNet.debug("XXXX minitab.selectedImage = " + minitab.selectedImage);
            Titanium.App.fireEvent('StatusNet_tabSelected', {
                index: index,
                tabName: minitab.name
            });
        } else {
            StatusNet.debug("minitab.deselectedImage = " + minitab.deselectedImage);
            minitab.image = minitab.deselectedImage;
        }
    }
};

StatusNet.TabbedMenuBar.prototype.createMiniTab = function(args) {

    StatusNet.debug("Going for tab # " + args.index);

    var minitab = Ti.UI.createImageView({
        image:args.deselectedImage,
        left: args.index * 40, // XXX calculate this better
        height: 40,
        width: 40,
        backgroundColor: '#7F7F7F'
    });

    minitab.index = args.index;
    minitab.name = args.name;
    minitab.deselectedImage = args.deselectedImage;
    minitab.selectedImage = args.selectedImage;

    var that = this;

    minitab.addEventListener('click', function()
    {        
        that.setSelectedTab(args.index);
    });

    return minitab;
};
