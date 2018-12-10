(function () {


    var isFullScreen = false;

    var app = new Vue({
        el: '#main',
        data: {
            height: 100,
            width: 100,
            version: 'v.1.0.0',
            menus: [{
                name: '网络',
                icon: 'fa-network-wired',
                active: true
            }, {
                name: '通知',
                icon: 'fa-bell',
                active: false
            }, {
                name: '帮助',
                icon: 'fa-question',
                active: false
            }]
        },
        methods: {
            btnMin: function () {
                var gui = require('nw.gui');
                var win = gui.Window.get();
                win.minimize();
            },
            btnClose: function () {
                try {
                    var gui = require('nw.gui');
                    gui.App.quit();
                } catch (e) {
                    console.log(e)
                }
            },
            btnFull: function () {
                var gui = require('nw.gui');
                var win = gui.Window.get();

                if (!isFullScreen) {
                    win.enterFullscreen();
                    isFullScreen = true;
                } else {
                    win.leaveFullscreen();
                    isFullScreen = false;
                }

            },
            menuHandler: function (menu) {
                app.menus.forEach(item => {
                    item.active = false;
                });
                menu.active = true;
            }
        }
    });

    var change = () => {
        var width = document.documentElement.clientWidth || document.body.clientWidth;
        var height = document.documentElement.clientHeight || document.body.clientHeight;

        app.height = height;
        app.width = width - 330;
    }

    window.onresize = change;
    window.onload = change;


    window.app = app;
})();
