angular.module('starter.controllers', [])
//动态效果只能用于animate-fade-slide-in或item或.animate-fade-slide-in .item
.controller('AppCtrl', function ($scope, $ionicModal, $ionicPopover, $timeout) {
    // Form data for the login modal
    $scope.loginData = {};
    $scope.isExpanded = false;
    $scope.hasHeaderFabLeft = false;
    $scope.hasHeaderFabRight = false;

    var navIcons = document.getElementsByClassName('ion-navicon');
    for (var i = 0; i < navIcons.length; i++) {
        navIcons.addEventListener('click', function () {
            this.classList.toggle('active');
        });
    }

    ////////////////////////////////////////
    // Layout Methods
    ////////////////////////////////////////

    $scope.hideNavBar = function () {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
    };

    $scope.showNavBar = function () {
        document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
    };

    $scope.noHeader = function () {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }
    };

    $scope.setExpanded = function (bool) {
        $scope.isExpanded = bool;
    };

    $scope.setHeaderFab = function (location) {
        var hasHeaderFabLeft = false;
        var hasHeaderFabRight = false;

        switch (location) {
            case 'left':
                hasHeaderFabLeft = true;
                break;
            case 'right':
                hasHeaderFabRight = true;
                break;
        }

        $scope.hasHeaderFabLeft = hasHeaderFabLeft;
        $scope.hasHeaderFabRight = hasHeaderFabRight;
    };

    $scope.hasHeader = function () {
        var content = document.getElementsByTagName('ion-content');
        for (var i = 0; i < content.length; i++) {
            if (!content[i].classList.contains('has-header')) {
                content[i].classList.toggle('has-header');
            }
        }

    };

    $scope.hideHeader = function () {
        $scope.hideNavBar();
        $scope.noHeader();
    };

    $scope.showHeader = function () {
        $scope.showNavBar();
        $scope.hasHeader();
    };

    $scope.clearFabs = function () {
        var fabs = document.getElementsByClassName('button-fab');
        if (fabs.length && fabs.length > 1) {
            fabs[0].remove();
        }
    };
})


.controller('HomeCtrl', function ($scope, News, $ionicSlideBoxDelegate, $timeout, ionicMaterialMotion) {
    

    $scope.$parent.setExpanded(false);
   
    
    
    News.getSlides().then(function (data) {
        $scope.slides = data;
        $ionicSlideBoxDelegate.update();
        $ionicSlideBoxDelegate.loop(true);
    });

    ionicMaterialMotion.fadeSlideInRight({
        selector: '.animate-fade-slide-in .item'
    });

})

.controller('NewsCtrl', function ($scope, News, $ionicLoading, $timeout, ionicMaterialMotion,$location,$state) {
    $scope.$parent.setExpanded(true);
    $scope.$parent.setHeaderFab('right');
    //动态效果
    

    $ionicLoading.show();
    
    $scope.scollData = { currentPageIndex: 1, haveData: true, pageLoading: true };
    News.getNews($scope.scollData.currentPageIndex, 10).then(function (data) {
        
        if (data == null) {
            $state.go("tab.news-unsucess");
        }
        $scope.data = data;
        $scope.scollData.pageLoading = false;
        //$scope.scollData.haveData = true;
        $ionicLoading.hide();
        $timeout(function () {
            ionicMaterialMotion.fadeSlideIn({
                selector: '.animate-fade-slide-in .item'
            });
        }, 200);
    });
    $scope.loadMore = function () {
        if ($scope.scollData.pageLoading) {
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }
        else {
            $scope.scollData.currentPageIndex += 1;
            News.getNews($scope.scollData.currentPageIndex, 10).then(function (data) {
                if (data == null || data.length == 0) {
                    $scope.scollData.haveData = false;
                    return;
                } else  $scope.scollData.haveData = true; 
                $scope.data = $scope.data.concat(data);
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $timeout(function () {
                    ionicMaterialMotion.fadeSlideIn({
                        selector: '.animate-fade-slide-in .item'
                    });
                }, 200);
                
            });
        }
    }

   
    $scope.doRefresh = function () {
        $scope.scollData.currentPageIndex = 1;
        News.getNews($scope.scollData.currentPageIndex, 10).then(function (data) {
            $scope.data = data;
            $scope.$broadcast('scroll.refreshComplete');
            $timeout(function () {
                ionicMaterialMotion.fadeSlideIn({
                    selector: '.animate-fade-slide-in .item'
                });
            }, 200);
        });
    }

    $scope.$on('$stateChangeSuccess', function () {
        $scope.scollData.haveData = true;
    });


    /*
        事件？
    */
})
.controller('NewsDetailsCtrl', function ($scope, News, $stateParams, $sce, $ionicLoading, Users, $state) {
    if (!Users.checkLogin()) $state.go('login');
    $scope.$parent.setExpanded(true);
    $ionicLoading.show();
    News.getInfomation($stateParams.id).then(function (data) {
        data.Contents = $sce.trustAsHtml(data.Contents);
        $scope.data = data;
        $ionicLoading.hide();
    });
})
.controller('NewsPublishCtrl', function ($scope, News, Camera, $ionicPopup, $ionicLoading, $state, Users) {
    if (!Users.checkLogin()) $state.go('login');
    $scope.$parent.setExpanded(true);
    $scope.data = { title: '你好', contents: '', pic: ['', '', ''] };

    $scope.getPicture = function (id, type) {
        Camera.getPicture(type).then(function (imageURI) {
            $scope.data.pic[id] = imageURI;
        }, function (err) {
        });
    };

    $scope.publish = function () {
        var checkTitle = $scope.data.title != '';
        var checkContents = $scope.data.contents != '';
        var checkPic = false;
        angular.forEach($scope.data.pic, function (item) { if (item != '') checkPic = true; });
        var checked = checkTitle && (checkPic || checkContents);

        if (!checked) {
            $ionicPopup.alert({
                title: 'iNUC 爱中北',
                template: "新闻标题和内容必须输入！"
            }).then(function (res) {
                return;
            });
        } else {
            var confirmPopup = $ionicPopup.confirm({
                title: '<strong>iNUC 爱中北</strong>',
                template: '是否确定发布新闻?',
                okText: '确定',
                cancelText: '取消'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    $ionicLoading.show();
                    News.publish($scope.data).then(
                        function () {
                            $ionicLoading.hide();
                            $ionicPopup.alert({
                                title: 'iNUC 爱中北',
                                template: "新闻发布成功，请等待审核！"
                            });
                            $state.go('tab.news', {}, { reload: true });
                        }, function () {
                            $ionicLoading.hide();
                            $ionicPopup.alert({
                                title: 'iNUC 爱中北',
                                template: "新闻发布失败，请重新上传！"
                            });
                        });
                }
            });
        }
    }
})

.controller('OANewsCtrl', function ($scope, OANews, $stateParams, $ionicTabsDelegate, Users, $state, $ionicLoading, $ionicActionSheet, $timeout, $ionicScrollDelegate, ionicMaterialMotion) {
    if (!Users.checkLogin()) $state.go('login');
    var newsType = ['校内新闻', '校内公告', '高教动态', '学术报告', '会议纪要', '领导讲话'];
    var sheetButtons = [];
    angular.forEach(newsType, function (data) { sheetButtons.push({ text: data }) });
    $scope.$parent.setExpanded(true);//设置导航栏扩展
    $scope.showSheet = function () {
        var hideSheet = $ionicActionSheet.show({
            buttons: sheetButtons,
            titleText: '请选择OA新闻类型',
            cancelText: '取消',
            buttonClicked: function (index) {
                $scope.scollData.currentPageIndex = 1;
                $scope.scollData.haveData = true;
                $ionicLoading.show();
                $scope.newTypeID = index + 1;
                $scope.newType = newsType[index];
                OANews.getNews($scope.newTypeID, $scope.scollData.currentPageIndex, 10).then(function (data) {
                    $scope.data = data;
                    $ionicLoading.hide();
                    $ionicScrollDelegate.scrollTop();
                    $timeout(function () {
                        ionicMaterialMotion.fadeSlideIn({
                            selector: '.animate-fade-slide-in .item'
                        });
                    }, 200);
                });

                return true;
            }
        });

        $timeout(function () {
            hideSheet();
        }, 5000);

    };

    $scope.scollData = { currentPageIndex: 1, haveData: false, pageLoading: true };
    $scope.newTypeID = 2;
    $scope.newType = newsType[1];

    $ionicLoading.show();
    OANews.getNews($scope.newTypeID, $scope.scollData.currentPageIndex, 10).then(function (data) {
        $scope.data = data;
        $scope.scollData.pageLoading = false;
        $ionicLoading.hide();
        $timeout(function () {
            ionicMaterialMotion.fadeSlideIn({
                selector: '.animate-fade-slide-in .item'
            });
        }, 200);

    });

    $scope.loadMore = function () {
        if ($scope.scollData.pageLoading) {
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }
        else {
            $scope.scollData.currentPageIndex += 1;
            OANews.getNews($scope.newTypeID, $scope.scollData.currentPageIndex, 10).then(function (data) {
                if (data == null || data.length == 0) {
                    $scope.scollData.haveData = false;
                    return;
                } else $scope.scollData.haveData = true;
                $scope.data = $scope.data.concat(data);
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $timeout(function () {
                    ionicMaterialMotion.fadeSlideIn({
                        selector: '.animate-fade-slide-in .item'
                    });
                }, 200);

            });
        }
    }

    $scope.doRefresh = function () {
        $scope.scollData.currentPageIndex = 1;
        OANews.getNews($scope.newTypeID, $scope.scollData.currentPageIndex, 10).then(function (data) {
            $scope.data = data;
            $scope.$broadcast('scroll.refreshComplete');
            $timeout(function () {
                ionicMaterialMotion.fadeSlideIn({
                    selector: '.animate-fade-slide-in .item'
                });
            }, 200);
        });
    }

    $scope.$on('$stateChangeSuccess', function () {
        $scope.scollData.haveData = true;
    });
})
.controller('OANewsDetailsCtrl', function ($scope, OANews, $stateParams, $sce, $ionicLoading) {
    $ionicLoading.show();
    $scope.$parent.setExpanded(true);
    OANews.getInfomation($stateParams.id).then(function (data) {
        data.Contents = $sce.trustAsHtml(data.Contents);
        $scope.data = data;
        $ionicLoading.hide();
    });
})

.controller('TalkingsCtrl', function ($scope, Talkings, $sce, $ionicPopup, $ionicLoading, Users, $state, $timeout, ionicMaterialMotion) {
    $scope.$parent.setExpanded(true);
 
    if (!Users.checkLogin()) $state.go('login');

    var maxNo = 15;
    $scope.scollData = { currentPageIndex: 1, haveData: false, pageLoading: true };
    $ionicLoading.show();
    Talkings.getTalkings($scope.scollData.currentPageIndex, maxNo).then(function (data) {
        angular.forEach(data, function (item) {
            item.Contents = $sce.trustAsHtml(item.Contents);
        })
        $scope.data = data;
        $scope.scollData.pageLoading = false;
        $ionicLoading.hide();
    });
    $scope.loadMore = function () {
        if ($scope.scollData.pageLoading) {
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }
        else {
            $scope.scollData.currentPageIndex += 1;
            Talkings.getTalkings($scope.scollData.currentPageIndex, maxNo).then(function (data) {
                if (data == null || data.length == 0) {
                    $scope.scollData.haveData = false;
                    return;
                } else $scope.scollData.haveData = true;
                angular.forEach(data, function (item) {
                    item.Contents = $sce.trustAsHtml(item.Contents);
                })
                $scope.data = $scope.data.concat(data);
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }
    }
    $scope.doRefresh = function () {
        $ionicLoading.show();
        $scope.scollData.currentPageIndex = 1;
        Talkings.getTalkings($scope.scollData.currentPageIndex, maxNo).then(function (data) {
            angular.forEach(data, function (item) {
                item.Contents = $sce.trustAsHtml(item.Contents);
            })
            $scope.data = data;
            $scope.$broadcast('scroll.refreshComplete');
            $ionicLoading.hide();
        });
    }

    $scope.$on('$stateChangeSuccess', function () {
        $scope.scollData.haveData = true;
    });

    $scope.doRemark = function (id) {
        $scope.remarks = {};
        var confirmPopup = $ionicPopup.prompt({
            title: '<strong>iNUC 爱中北</strong>',
            template: '<textarea style="width: 95%; height: 100px;" ng-model="remarks.response"></textarea>',
            inputPlaceholder: '评论...',
            buttons: [{
                text: '取消',
                type: 'button-default',
                onTap: function (e) {
                    $scope.remarks.response = null;
                }
            }, {
                text: '提交',
                type: 'button-positive',
                onTap: function (e) {
                    if (!$scope.remarks.response) e.preventDefault();
                    else return $scope.remarks.response;
                }
            }],
            scope: $scope
        });

        confirmPopup.then(function (res) {
            if (!$scope.remarks.response) return;

            Talkings.remark(id, $scope.remarks.response, '').then(
                        function () {
                            //$ionicPopup.alert({
                            //    title: 'iNUC 爱中北',
                            //    template: "评论成功"
                            //});
                            //$state.go('tab.talkings');
                            $scope.doRefresh();//评论完自动刷新
                        }, function () {
                            $ionicPopup.alert({
                                title: 'iNUC 爱中北',
                                template: "评论失败，请重新上传！"
                            });
                        });
        });
    }

})
.controller('TalkingPublishCtrl', function ($scope, Talkings, Camera, $ionicPopup, $ionicLoading, $state, Users) {

    if (!Users.checkLogin()) $state.go('login');

    $scope.data = { contents: '', pic: ['', '', ''] };

    $scope.getPicture = function (id, type) {
        Camera.getPicture(type).then(function (imageURI) {
            $scope.data.pic[id] = imageURI;
        }, function (err) {
        });
    };

    $scope.publish = function () {
        var checkContents = $scope.data.contents != '';
        var checkPic = false;
        angular.forEach($scope.data.pic, function (item) { if (item != '') checkPic = true; });
        var checked = checkPic && checkContents;

        if (!checked) {
            $ionicPopup.alert({
                title: 'iNUC 爱中北',
                template: "内容必须输入！"
            }).then(function (res) {
                return;
            });
        } else {
            var confirmPopup = $ionicPopup.confirm({
                title: '<strong>iNUC 爱中北</strong>',
                template: '是否确定发布话题?',
                okText: '确定',
                cancelText: '取消'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    $ionicLoading.show();
                    Talkings.publish($scope.data).then(
                        function () {
                            $ionicLoading.hide();
                            $ionicPopup.alert({
                                title: 'iNUC 爱中北',
                                template: "话题发布成功，请等待审核！"
                            });
                            $state.go('tab.talkings', {}, { reload: true });
                        }, function () {
                            $ionicLoading.hide();
                            $ionicPopup.alert({
                                title: 'iNUC 爱中北',
                                template: "话题发布失败，请重新上传！"
                            });
                        });
                }
            });
        }
    }
})

.controller('LettersCtrl', function ($scope, Letters, $stateParams, $ionicTabsDelegate, $ionicLoading, $ionicModal, $ionicScrollDelegate, $ionicActionSheet, $timeout) {
    var maxNo = 15;
    var letterTypes = ['所有', '教学', '科研', '人事', '党建', '其他'];
    var sheetButtons = [];
    angular.forEach(letterTypes, function (data) { sheetButtons.push({ text: data }) });
    $scope.searchData = { letterType: letterTypes[0], letterTitle: '' };

    $scope.showSheet = function () {
        var hideSheet = $ionicActionSheet.show({
            buttons: sheetButtons,
            titleText: '请选择信件类型',
            cancelText: '取消',
            buttonClicked: function (index) {
                $scope.scollData.currentPageIndex = 1;
                $scope.scollData.haveData = true;
                $ionicLoading.show();
                $scope.searchData.letterType = letterTypes[index];
                Letters.getLetters($scope.searchData.letterType, $scope.searchData.letterTitle, $scope.scollData.currentPageIndex, maxNo).then(function (data) {
                    $scope.data = data;
                    $ionicLoading.hide();
                    $ionicScrollDelegate.scrollTop();
                });

                return true;
            }
        });

        $timeout(function () {
            hideSheet();
        }, 5000);

    };

    $scope.scollData = { currentPageIndex: 1, haveData: false, pageLoading: true };

    $ionicLoading.show();
    Letters.getLetters($scope.searchData.letterType, $scope.searchData.letterTitle, $scope.scollData.currentPageIndex, maxNo).then(function (data) {
        $scope.data = data;
        $scope.scollData.pageLoading = false;
        $ionicLoading.hide();
    });

    $scope.loadMore = function () {
        if ($scope.scollData.pageLoading) {
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }
        else {
            $scope.scollData.currentPageIndex += 1;
            Letters.getLetters($scope.searchData.letterType, $scope.searchData.letterTitle, $scope.scollData.currentPageIndex, maxNo).then(function (data) {
                if (data == null || data.length == 0) {
                    $scope.scollData.haveData = false;
                    return;
                } else $scope.scollData.haveData = true;
                $scope.data = $scope.data.concat(data);
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }
    }

    $scope.doRefresh = function () {
        $scope.scollData.currentPageIndex = 1;
        Letters.getLetters($scope.searchData.letterType, $scope.searchData.letterTitle, $scope.scollData.currentPageIndex, maxNo).then(function (data) {
            $scope.data = data;
            $scope.$broadcast('scroll.refreshComplete');
        });
    }

    $scope.$on('$stateChangeSuccess', function () {
        $scope.scollData.haveData = true;
    });
})
.controller('LettersDetailsCtrl', function ($scope, Letters, $stateParams, $sce, $ionicLoading, Users, $state) {
    if (!Users.checkLogin()) $state.go('login');
    $ionicLoading.show();
    Letters.getLetter($stateParams.id).then(function (data) {
        data.Contents = $sce.trustAsHtml(data.Contents);
        data.RepliedContents = $sce.trustAsHtml(data.RepliedContents);
        $scope.data = data;
        $ionicLoading.hide();
    });
})

.controller('OAMeetingsCtrl', function ($scope, OAMeetings, $ionicLoading, Users, $state) {
    if (!Users.checkLogin()) $state.go('login');
    $ionicLoading.show();
    if (!$scope.firstDay) {
        var today = new Date();
        var firstDay = new Date(today.getTime() - (today.getDay() - 1) * 24 * 60 * 60 * 1000);
        $scope.firstDay = firstDay;
        $scope.endDay = new Date(firstDay.getTime() + 6 * 24 * 60 * 60 * 1000);
    }
    OAMeetings.getMeetings($scope.firstDay).then(function (data) {
        $scope.data = data;
        $ionicLoading.hide();
    });

    $scope.changeWeek = function (day) {
        $ionicLoading.show();
        if (day > 0) {
            $scope.firstDay = new Date($scope.firstDay.getTime() + 7 * 24 * 60 * 60 * 1000);
            $scope.endDay = new Date($scope.endDay.getTime() + 7 * 24 * 60 * 60 * 1000);
        } else {
            $scope.firstDay = new Date($scope.firstDay.getTime() - 7 * 24 * 60 * 60 * 1000);
            $scope.endDay = new Date($scope.endDay.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        OAMeetings.getMeetings($scope.firstDay).then(function (data) {
            $scope.data = data;
            $ionicLoading.hide();
        });
    }
})
.controller('OAMeetingDetailsCtrl', function ($scope, OAMeetings, $stateParams, $ionicLoading, Users, $state) {
    if (!Users.checkLogin()) $state.go('login');

    $ionicLoading.show();
    OAMeetings.getMeeting($stateParams.id).then(function (data) {
        $scope.data = data;
        $ionicLoading.hide();
    });
})

.controller('CommodityCtrl', function ($scope, Market, $ionicLoading) {
    $ionicLoading.show();
    $scope.scollData = { currentPageIndex: 1, haveData: false, pageLoading: true };
    Market.getCommodities('', '', $scope.scollData.currentPageIndex, 10).then(function (data) {
        $scope.data = data;
        $scope.scollData.pageLoading = false;
        $ionicLoading.hide();
    });
    $scope.loadMore = function () {
        if ($scope.scollData.pageLoading) {
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }
        else {
            $scope.scollData.currentPageIndex += 1;
            Market.getCommodities('', '', $scope.scollData.currentPageIndex, 10).then(function (data) {
                if (data == null || data.length == 0) {
                    $scope.scollData.haveData = false;
                    return;
                } else $scope.scollData.haveData = true;
                $scope.data = $scope.data.concat(data);
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }
    }
    $scope.doRefresh = function () {
        $scope.scollData.currentPageIndex = 1;
        Market.getCommodities('', '', $scope.scollData.currentPageIndex, 10).then(function (data) {
            $scope.data = data;
            $scope.$broadcast('scroll.refreshComplete');
        });
    }

    $scope.$on('$stateChangeSuccess', function () {
        $scope.scollData.haveData = true;
    });

})
.controller('CommodityDetailsCtrl', function ($scope, Market, $stateParams, $sce, $ionicLoading, Users, $state, $ionicSlideBoxDelegate) {
    if (!Users.checkLogin()) $state.go('login');

    $ionicLoading.show();
    Market.getCommodity($stateParams.id).then(function (data) {
        $scope.data = data;
        $scope.pictures = [];
        if (data.PictureUrl != '') $scope.pictures.push(data.PictureUrl);
        if (data.PictureUrl2 != '') $scope.pictures.push(data.PictureUrl2);
        if (data.PictureUrl3 != '') $scope.pictures.push(data.PictureUrl3);
        $ionicSlideBoxDelegate.update();
        $ionicSlideBoxDelegate.loop(true);
        $ionicLoading.hide();
    });
})
.controller('CommodityPublishCtrl', function ($scope, Market, Users, Camera, $ionicPopup, $ionicLoading, $state) {
    if (!Users.checkLogin()) $state.go('login');
    var now = new Date();
    var tradeEndTime = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    $scope.data = { title: '', description: '', price: 0.0, contact: Users.getUsername(), labels: '其他', newness: '', maxCount: 999, place: '', tradeEndTime: tradeEndTime, pic: ['', '', ''] };

    Market.getCommodityLabels().then(function (data) {
        $scope.commodityLabels = data;
    });

    $scope.getPicture = function (id, type) {
        Camera.getPicture(type).then(function (imageURI) {
            $scope.data.pic[id] = imageURI;
        }, function (err) {
        });
    };

    $scope.publish = function () {
        var checkTitle = $scope.data.title != '';
        var checkContents = $scope.data.contents != '';
        var checkNewness = $scope.data.newness != '';
        var checkContact = $scope.data.contact != '';
        var checkPic = false;
        angular.forEach($scope.data.pic, function (item) { if (item != '') checkPic = true; });
        var checked = checkTitle && checkContents && checkNewness && checkContact && checkPic;

        if (!checked) {
            $ionicPopup.alert({
                title: 'iNUC 爱中北',
                template: "内容和商品图片必须输入！"
            }).then(function (res) {
                return;
            });
        } else {
            var confirmPopup = $ionicPopup.confirm({
                title: '<strong>iNUC 爱中北</strong>',
                template: '是否确定发布商品?',
                okText: '确定',
                cancelText: '取消'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    $ionicLoading.show();
                    Market.publish($scope.data).then(
                        function () {
                            $ionicLoading.hide();
                            $ionicPopup.alert({
                                title: 'iNUC 爱中北',
                                template: "商品发布成功！"
                            });
                            $state.go('tab.commodity', {}, { reload: true });
                        }, function () {
                            $ionicLoading.hide();
                            $ionicPopup.alert({
                                title: 'iNUC 爱中北',
                                template: "商品发布失败，请重新上传！"
                            });
                        });
                }
            });
        }
    }
})

.controller('SetCtrl', function ($scope, Users) {
    $scope.$parent.setExpanded(true);

    $scope.isLogin = Users.checkLogin();
    $scope.username = Users.getUsername();
    var picture = Users.getPersonnelPicuture();
    if (picture) $scope.picture = picture; else $scope.picture = 'img/person.png';
})

.controller('LoginCtrl', function ($scope, Users, $ionicHistory, $state, $stateParams, $ionicLoading) {
    $scope.loginData = {};

    $scope.doLogin = function () {
        $ionicLoading.show();
        Users.login($scope.loginData.username, $scope.loginData.password)
            .then(function (data) {
                $ionicLoading.hide();
                if ($ionicHistory.backView()) {
                    $ionicHistory.goBack();
                } else {
                    $state.go('tab.set');
                }
            }, function (data) {
                navigator.notification.alert('您输入的用户名和密码不正确', function () { }, '登陆', '重新输入');
                $ionicLoading.hide();
            });
    };

    $scope.goBack = function () {
        $ionicHistory.goBack();
    }

    $scope.logOut = function () {
        Users.logoff();
        $state.go('tab.home');
    };
})
.controller('ChangePasswordCtrl', function ($scope, Users, $ionicHistory, $state, $stateParams, $ionicLoading, $ionicPopup) {
    $scope.loginData = { username: Users.getUsername() };

    $scope.doChange = function () {
        $ionicLoading.show();
        Users.changePassword($scope.loginData.username, $scope.loginData.oldPassword, $scope.loginData.newPassword)
            .then(function (data) {
                $ionicLoading.hide();
                if (!data) {
                    navigator.notification.alert("修改密码失败", function () { }, '登陆', '重新输入');
                } else {
                    Users.wipe();
                    var alertPopup = $ionicPopup.alert({
                        title: '修改密码',
                        template: '密码修改成功，点击确定后重新登陆'
                    });
                    alertPopup.then(function (res) {
                        $state.go('tab.set');
                    });
                }
            }, function (data) {
                navigator.notification.alert('您输入的用户名和密码不正确', function () { }, '登陆', '重新输入');
                $ionicLoading.hide();
            });
    };

    $scope.goBack = function () {
        $ionicHistory.goBack();
    }

    $scope.logOut = function () {
        Users.logoff();
        $state.go('tab.home');
    };
})
.controller('RegisterCtrl', function ($scope, Users, $ionicHistory, $state, $ionicLoading, $interval) {
    $scope.loginData = { sex: '男' };
    $scope.controlCodeButtonData = { enable: true, start: 0, text: 0 };

    $scope.getCode = function () {
        $scope.controlCodeButtonData.enable = false;
        $scope.controlCodeButtonData.start = new Date();
        var timeI = $interval(function () {
            var t = new Date();
            var s = t - $scope.controlCodeButtonData.start;
            var d = parseInt(s / 1000);
            if (d >= 60) {
                $scope.controlCodeButtonData.enable = true;
                $interval.cancel(timeI);
            }
            $scope.controlCodeButtonData.text = '60秒后重试(' + d + ')';
        }, 500);
        Users.getVerificationCode($scope.loginData.username).then(
            function (data) {
                if (!data) {
                    alert('发送验证码失败，请确认手机号未注册');
                    $scope.controlCodeButtonData.enable = true;
                    $interval.cancel(timeI);
                    return;
                }
            }
            );
    };

    $scope.doRegister = function () {
        if ($scope.loginData.password !== $scope.loginData.confirm) {
            alert('密码和验证码不匹配');
            return;
        }
        $ionicLoading.show();
        Users.register($scope.loginData.username, $scope.loginData.password, $scope.loginData.code, $scope.loginData.nickname, $scope.loginData.sex)
            .then(function (data) {
                if (data) alert(data);
                else {
                    Users.login($scope.loginData.username, $scope.loginData.password)
                    .then(function (data) {
                        $ionicLoading.hide();
                        $state.go('tab.set');
                    });
                }
            });
    };


})

.controller('MyCtrl', function ($scope, Users) {
    Users.getPersonnel(Users.getUsername()).then(function (data) {
        $scope.personnel = data;
        localStorage.setItem('personnelPicuture', data.PictureUrl)
    }, function (data) {

    });
})
.controller('MyUpdateCtrl', function ($scope, Users, $ionicPopup, $ionicLoading, Camera, $state) {
    Users.getPersonnel(Users.getUsername()).then(function (data) {
        $scope.data = data;
    }, function (data) {

    });

    $scope.getPicture = function (type) {
        Camera.getSquarePicture(type).then(function (image) {
            $scope.data.PictureUrl = "data:image/jpeg;base64," + image;
        }, function (err) {
        });
    };

    $scope.doUpdate = function () {
        var confirmPopup = $ionicPopup.confirm({
            title: '<strong>iNUC 爱中北</strong>',
            template: '是否确定修改?',
            okText: '确定',
            cancelText: '取消'
        });

        confirmPopup.then(function (res) {
            if (res) {
                $ionicLoading.show();
                Users.updateUser($scope.data).then(
                    function () {
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: 'iNUC 爱中北',
                            template: "个人信息更新成功！"
                        });
                        $state.go('tab.my', {}, { reload: true });
                    }, function () {
                        $ionicLoading.hide();
                        $ionicPopup.alert({
                            title: 'iNUC 爱中北',
                            template: "个人信息更新失败，请重新上传！"
                        });
                    });
            }
        });
    }
})
;
