// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services','ionic-material'])//加入ionic-input 会白

.run(function ($ionicPlatform, $location, $rootScope, $ionicHistory, $ionicLoading, AppSystem) {
    function downloadProgress(downloadProgress) {
        if (downloadProgress) {
            $ionicLoading.show({
                template: '正在下载：' + downloadProgress.receivedBytes + '/' + downloadProgress.totalBytes
            });
            // Update "downloading" modal with current download %
            //console.log("Downloading " + downloadProgress.receivedBytes + " of " + downloadProgress);
        }
    }
    function syncStatus(status) {
        switch (status) {
            case SyncStatus.DOWNLOADING_PACKAGE:
                // Show "downloading" modal
                break;
            case SyncStatus.INSTALLING_UPDATE:
                $ionicLoading.hide();
                window.plugins.toast.showLongCenter('App已经更新');
                break;
        }
    }
    var updateApp = function () {
        codePush.sync(syncStatus, {
            updateDialog: {
                updateTitle: '更新',
                optionalIgnoreButtonLabel: '忽略',
                optionalInstallButtonLabel: '安装',
                optionalUpdateMessage: '有新的更新可用，是否安装？',
                //mandatoryUpdateMessage: '',
                //mandatoryContinueButtonLabel: ''
            }, installMode: InstallMode.IMMEDIATE
        },
            downloadProgress
            );
    }

    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (cordova.platformId === "ios" && window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

        $ionicPlatform.registerBackButtonAction(function (e) {
            //判断处于哪个页面时双击退出


            //if ($location.path() === '/tab/home') {
                    if ($rootScope.backButtonPressedOnceToExit) {
                        ionic.Platform.exitApp();
                    } else {
                    $rootScope.backButtonPressedOnceToExit = true;
                    window.plugins.toast.showShortCenter('再按一次退出App');
                    setTimeout(function () {
                        $rootScope.backButtonPressedOnceToExit = false;
                    }, 2000);
                }
            //}
            //else if ($location.path() != '/tab/home') {
            //    $ionicHistory.goBack();
            //} else {
            //    $rootScope.backButtonPressedOnceToExit = true;
            //    window.plugins.toast.showShortCenter('再按一次退出App');
            //    setTimeout(function () {
            //        $rootScope.backButtonPressedOnceToExit = false;
            //    }, 2000);
            //}
            e.preventDefault();
            return false;
        }, 101);

        updateApp();

        document.addEventListener("resume", function () {
            updateApp();
        });

        AppSystem.appLogin();
    });
})

.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    //隐藏文字
    $ionicConfigProvider.backButton.text("");
    $ionicConfigProvider.backButton.previousTitleText(false);
    $ionicConfigProvider.views.maxCache(0);

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
    .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html',
        controller:'AppCtrl'
    })

    .state('tab.home', {
        url: '/home',
        views: {
            'tab-home': {
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl'
            },
            'fabContent': {
        template: '',
    }
        }
    })
    .state('tab.news', {
        url: '/news',
        views: {
            'tab-news': {
                templateUrl: 'templates/news/news-list.html',
                controller: 'NewsCtrl'
            } ,
            'fabContent': {//必要的是为class增添一个颜色样式  不添加会导致看不到图标 这句话很正确：注意: 按钮文字和边框颜色会使用按钮的颜色样式（这就是为什么显示不出来，想要显示什么颜色，应用就好了）,就是说 button-positive 会使文字和边框变成蓝色,背景却是透明的.
                template: '<button id="fab-activity" class="button button-outline button-positive button-fab button-fab-top-right spin flap"  ui-sref="tab.news-publish"><i class="icon ion-paper-airplane"></button>',
                controller: function ($timeout) {
                    $timeout(function () {
                        document.getElementById('fab-activity').classList.toggle('on');
                    }, 200);
                }
            }
           
        }
    })
    .state('tab.news-details', {
        url: '/news-details/:id',
        views: {
            'tab-news': {
                templateUrl: 'templates/news/news-details.html',
                controller: 'NewsDetailsCtrl'
            },
            'fabContent': {
                template: '',
            }
        }
    })
    .state('tab.news-unsucess', {
        url: '/news-unsucess',
        views: {
            'tab-news': {
                templateUrl: 'templates/news/news-unsucess.html'
            },
            'fabContent': {
                template: '',
            }
        }
    })
    .state('tab.news-publish', {
        url: '/news-publish',
        views: {
            'tab-news': {
                templateUrl: 'templates/news/news-publish.html',
                controller: 'NewsPublishCtrl'
            },
            'fabContent': {
                template: '',
            }
        }
    })

    .state('tab.oanews', {
        url: '/oanews',
        views: {
            'tab-home': {
                templateUrl: 'templates/oanews/news-list.html',
                controller: 'OANewsCtrl'
            },
            'fabContent': {
                template: '',
            }
        }
    })
    .state('tab.oanews-details', {
        url: '/oanews-details/:id',
        views: {
            'tab-home': {
                templateUrl: 'templates/oanews/news-details.html',
                controller: 'OANewsDetailsCtrl'
            },
            'fabContent': {
                template: '',
            }
        }
    })

    .state('tab.talkings', {
        url: '/talkings',
        views: {
            'tab-talkings': {
                templateUrl: 'templates/talkings/talkings.html',
                controller: 'TalkingsCtrl'
            },
            'fabContent': {
                template: '<button id="fab-friends" class="button button-outline button-positive button-fab button-fab-top-right spin " ui-sref="tab.talking-publish"><i class="icon ion-chatbubbles"></i></button>',
                controller: function ($timeout) {
                    $timeout(function () {
                        document.getElementById('fab-friends').classList.toggle('on');
                    }, 200);
                }
            }
        }
    })
    .state('tab.talking-publish', {
        url: '/talking-publish',
        views: {
            'tab-talkings': {
                templateUrl: 'templates/talkings/talking-publish.html',
                controller: 'TalkingPublishCtrl'
            },
            'fabContent': {
                template: '',
            }
        }
    })

    .state('tab.letters', {
        url: '/letters',
        views: {
            'tab-home': {
                templateUrl: 'templates/letters/letter-list.html',
                controller: 'LettersCtrl'
            },
            'fabContent': {
                template: '',
            }
        }
    })
    .state('tab.letter-details', {
        url: '/letter-details/:id',
        views: {
            'tab-home': {
                templateUrl: 'templates/letters/letter-details.html',
                controller: 'LettersDetailsCtrl'
            },
            'fabContent': {
                template: '',
            }
        }
    })

    .state('tab.oameetings', {
        url: '/oameetings',
        views: {
            'tab-home': {
                templateUrl: 'templates/oameetings/meeting-list.html',
                controller: 'OAMeetingsCtrl'
            },
            'fabContent': {
                template: '',
            }
        }
    })

    .state('tab.commodity', {
        url: '/commodity',
        views: {
            'tab-home': {
                templateUrl: 'templates/market/commodity-list.html',
                controller: 'CommodityCtrl'
            },
            'fabContent': {
                template: '',
            }
        }
    })
    .state('tab.commodity-details', {
        url: '/commodity-details/:id',
        views: {
            'tab-home': {
                templateUrl: 'templates/market/commodity-details.html',
                controller: 'CommodityDetailsCtrl'
            },
            'fabContent': {
                template: '',
            }
        }
    })
    .state('tab.commodity-publish', {
        url: '/commodity-publish',
        views: {
            'tab-home': {
                templateUrl: 'templates/market/commodity-publish.html',
                controller: 'CommodityPublishCtrl'
            },
            'fabContent': {
                template: '',
            }
        }
    })


    .state('tab.set', {
        url: '/set',
        views: {
            'tab-set': {
                templateUrl: 'templates/set.html',
                controller: 'SetCtrl'
            },
            'fabContent': {
                template: '',
            }
        }
    })
    .state('tab.my', {
        url: '/my',
        views: {
            'tab-set': {
                templateUrl: 'templates/personnel/my.html',
                controller: 'MyCtrl'
            },
            'fabContent': {
                template: '',
            }
        }
    })
    .state('tab.my-update', {
        url: '/my-update',
        views: {
            'tab-set': {
                templateUrl: 'templates/personnel/my-update.html',
                controller: 'MyUpdateCtrl'
            },
            'fabContent': {
                template: '',
            }
        }
    })

    .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
    })
    .state('changePassword', {
        url: '/changePassword',
        templateUrl: 'templates/personnel/changePassword.html',
        controller: 'ChangePasswordCtrl'
    })
    .state('register', {
        url: '/register',
        templateUrl: 'templates/personnel/register.html',
        controller: 'RegisterCtrl'
    })
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/home');

})

.config(function ($ionicConfigProvider) {
    $ionicConfigProvider.tabs.position('bottom').style('standard');
})

.constant("$ionicLoadingConfig", { template: '<ion-spinner icon="circles" class="spinner-positive"></ion-spinner>', duration: 5000 })

.config(function ($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
      // Allow same origin resource loads.
      'self',
      // Allow loading from our assets domain.  Notice the difference between * and **.
      'http://www.i-nuc.com/**'
    ]);

    // The blacklist overrides the whitelist so the open redirect here is blocked.
    $sceDelegateProvider.resourceUrlBlacklist([
      'http://myapp.example.com/clickThru**'
    ]);
})

.config(function ($httpProvider) {
    $httpProvider.interceptors.push(function () {
        return {
            'request': function (config) {
                config.headers = config.headers || {};
                var token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = 'Bearer ' + token;
                }
                return config;
            },
            //'responseError': function (response) {
            //    if (response.status === 401 || response.status === 403) {
            //        //如果之前登陆过
            //        if (User.getToken()) {
            //            $rootScope.$broadcast('unAuthenticed');
            //        }
            //    }
            //    return $q.reject(response);
            //}
        };
    });

    //$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
})
;
