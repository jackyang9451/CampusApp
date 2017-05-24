var _host = "http://59.48.248.41:1020/iNUC";
//var _host = "http://localhost:56496";

var _url = _host + "/api/interface";
var _token = _host + "/Token";

angular.module('starter.services', [])

.factory('Camera', ['$q', function ($q) {
    return {
        getPicture: function (type, width, height) {
            if (!width) width = 800;
            if (!height) height = 600;
            var options;
            if (type === 1) options = {
                quality: 75,
                sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                allowEdit: true,
                targetWidth: width,
                targetHeight: height,
                saveToPhotoAlbum: true
            };
            else options = {
                quality: 75,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                targetWidth: width,
                targetHeight: height,
                saveToPhotoAlbum: false
            };
            var q = $q.defer();

            navigator.camera.getPicture(function (result) {
                q.resolve(result);
            }, function (err) {
                q.reject(err);
            }, options);

            return q.promise;
        },
        getSquarePicture: function (type) {
            var options;
            if (type === 1) options = {
                quality: 75,
                //destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                allowEdit: true,
                targetWidth: 400,
                targetHeight: 400,
                saveToPhotoAlbum: true
            };
            else options = {
                quality: 75,
                //destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                targetWidth: 400,
                targetHeight: 400,
                saveToPhotoAlbum: false
            };
            var q = $q.defer();

            navigator.camera.getPicture(function (result) {
                q.resolve(result);
            }, function (err) {
                q.reject(err);
            }, options);

            return q.promise;
        }
    }
}])

.factory('Users', function ($http, $q) {
    var storeToken = function (username, token, tags, personnelPicuture) {
        localStorage.setItem('username', username);
        localStorage.setItem('tags', tags);
        localStorage.setItem('token', token);
        localStorage.setItem('personnelPicuture', personnelPicuture);
    }
    var getToken = function () {
        return localStorage.getItem('token');
    }
    var getUsername = function () {
        return localStorage.getItem('username');
    }
    var getTags = function () {
        return localStorage.getItem('tags');
    }
    var getPersonnelPicuture = function () {
        return localStorage.getItem('personnelPicuture');
    }
    var clearToken = function () {
        localStorage.clear();
    }

    return {
        login: function (username, password) {
            var deferred = $q.defer();
            $http({
                method: "POST",
                url: _token,
                data: "username=" + username + "&password=" + password + "&grant_type=password",
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
            .success(function (data) {
                storeToken(username, data.access_token, data.Tags, data.PersonnelPicuture);
                deferred.resolve(username);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        logoff: function (username, password) {
            clearToken();
        },
        getVerificationCode: function (username) {
            var deferred = $q.defer();
            $http.post(_url + '/GetVerificationCode', { mobilephone: username })
            .success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        register: function (username, password, code, nickname, sex) {
            var deferred = $q.defer();
            $http.post(_url + '/CreateUser', { mobilephone: username, password: password, code: code, nickname: nickname, sex: sex })
            .success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        updateUser: function (data) {
            var deferred = $q.defer();

            var prex = 'base64,';
            data.PictureUrl = data.PictureUrl.substr(data.PictureUrl.indexOf(prex) + prex.length);
            $http.post(_url + '/UpdateUser', { name: data.name, studentNo: data.studentNo, nickname: data.nickname, sex: data.sex, picCode: data.PictureUrl })
            .success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },

        getPersonnel: function (username) {
            var deferred = $q.defer();
            $http.post(_url + '/GetPersonnel', {})
            .success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        changePassword: function (username, oldPassword, newPassword) {
            var deferred = $q.defer();
            $http.post(_url + '/ChangePassword', { oldPassword: oldPassword, newPassword: newPassword })
            .success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        getTags: function () {
            var deferred = $q.defer();
            $http.post(_url + '/GetTags')
            .success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.resolve(null);
            });
            return deferred.promise;
        },
        checkLogin: function () {
            //var deferred = $q.defer();
            //$http.post(_url + '/CheckLogin', {})
            //.success(function (data) {
            //    deferred.resolve(data);
            //}).error(function (data) {
            //    deferred.reject(false);
            //});
            //return deferred.promise;
            var username = getUsername();
            if (username) return true; else return false;
        },
        wipe: function () {
            clearToken();
        },
        getUsername: function () {
            return getUsername();
        },
        //getTags: function () {
        //    return getTags();
        //},
        getPersonnelPicuture: function () {
            return getPersonnelPicuture();
        },
        getToken: function () {
            return getToken();
        },
    };
})

.factory('AppSystem', function ($http, $q) {
    return {
        appLogin: function () {
            var deferred = $q.defer();
            var state = 1;
            var imei = '';
            var applicationTime = new Date();
            var username = localStorage.getItem('username');
            var versionID = 1;
            $http.post(_url + '/AppLogin', { state: state, imei: imei, applicationTime: applicationTime, username: username, versionID: versionID })
            .success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
    };
})

.factory('News', function ($http, $q) {
    return {
        getSlides: function () {
            var deferred = $q.defer();
            $http.get(_url + '/GetPictureNews?pageSize=5', {})
            .success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        getNews: function (pageIndex, pageSize) {
            var deferred = $q.defer();
            $http.get(_url + '/GetNews?pageIndex=' + pageIndex + "&pageSize=" + pageSize, {})
            .success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        getInfomation: function (id) {
            var deferred = $q.defer();
            $http.get(_url + '/GetNewsContent?id=' + id, {})
            .success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        publish: function (data) {
            var fileTransfer = new FileTransfer();
            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.mimeType = "image/jpeg";
            var targetPath = _host + '/File/UploadImage';

            var defs = [];

            var s = '';
            angular.forEach(data.pic, function (item) {
                if (item) {
                    var deferred = $q.defer();
                    options.fileName = item.substr(item.lastIndexOf('/') + 1);
                    fileTransfer.upload(item, targetPath, function (success) {
                        s += success.response.substring(2);
                        deferred.resolve(success);
                    }, function (error) {
                        deferred.reject(error);
                    }, options);
                    defs.push(deferred.promise);
                }
            });

            var deferred = $q.defer();
            $q.all(defs).then(
                function (success) {
                    $http.post(_url + '/PublishNews', { title: data.title, contents: data.contents + s, picCode: '' })
                    .success(function (success) {
                        deferred.resolve(success);
                    }).error(function (error) {
                        deferred.reject(error);
                    });
                },
                function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        },
    };
})

.factory('OANews', function ($http, $q) {
    return {
        getNews: function (type, pageIndex, pageSize) {
            var deferred = $q.defer();
            $http.get(_url + '/GetOANews?type=' + type + '&pageIndex=' + pageIndex + '&pageSize=' + pageSize, {})
            .success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        getInfomation: function (id) {
            var deferred = $q.defer();
            $http.get(_url + '/GetOANewsDetails?id=' + id, {})
            .success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
    };
})

.factory('Talkings', function ($http, $q) {
    return {
        getTalkings: function (pageIndex, pageSize) {
            var deferred = $q.defer();
            $http.get(_url + '/GetTalkings?pageIndex=' + pageIndex + '&pageSize=' + pageSize + '&remarksPageIndex=1&remarksPageSize=100', {})
            .success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        publish: function (data) {
            var fileTransfer = new FileTransfer();
            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.mimeType = "image/jpeg";
            var targetPath = _host + '/File/UploadImage';

            var defs = [];

            var s = '';
            angular.forEach(data.pic, function (item) {
                if (item) {
                    var deferred = $q.defer();
                    options.fileName = item.substr(item.lastIndexOf('/') + 1);
                    fileTransfer.upload(item, targetPath, function (success) {
                        s += success.response.substring(2);
                        deferred.resolve(success);
                    }, function (error) {
                        deferred.reject(error);
                    }, options);
                    defs.push(deferred.promise);
                }
            });

            var deferred = $q.defer();
            $q.all(defs).then(
                function (success) {
                    $http.post(_url + '/PublishTalking', { contents: data.contents + s, picCode: '' })
                    .success(function (success) {
                        deferred.resolve(success);
                    }).error(function (error) {
                        deferred.reject(error);
                    });
                },
                function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        },
        remark: function (talkingID, remarks, imei) {
            var deferred = $q.defer();
            $http.post(_url + '/AddTalkingRemark', { talkingID: talkingID, remarks: remarks, imei: imei })
            .success(function (success) {
                deferred.resolve(success);
            }).error(function (error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },
    };
})

.factory('Letters', function ($http, $q) {
    return {
        getLetters: function (type, title, pageIndex, pageSize) {
            var deferred = $q.defer();
            $http.get(_url + '/GetLetters?letterType=' + encodeURIComponent(type) + '&title=' + encodeURIComponent(title) + '&pageIndex=' + pageIndex + '&pageSize=' + pageSize, {})
            .success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        getLetter: function (id) {
            var deferred = $q.defer();
            $http.get(_url + '/GetLetter?letterID=' + id, {})
            .success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
    };
})

.factory('OAMeetings', function ($http, $q) {
    return {
        getMeetings: function (day) {
            var deferred = $q.defer();
            var time = day.getFullYear() + '-' + (day.getMonth() + 1) + '-' + day.getDate();
            $http.get(_url + '/GetOAMeetings?day=' + encodeURIComponent(time), {})
            .success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        getMeeting: function (id) {
            var deferred = $q.defer();
            $http.get(_url + '/GetOANewsDetails?id=' + id, {})
            .success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
    };
})

.factory('Market', function ($http, $q) {
    return {
        getCommodities: function (label, title, pageIndex, pageSize) {
            var deferred = $q.defer();
            $http.get(_url + '/GetCommodities?label=' + label + '&title=' + title + '&pageIndex=' + pageIndex + "&pageSize=" + pageSize, {})
            .success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        getCommodity: function (id) {
            var deferred = $q.defer();
            $http.get(_url + '/GetCommodity?id=' + id, {})
            .success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        getCommodityLabels: function () {
            var deferred = $q.defer();
            $http.get(_url + '/GetCommodityLabels', {})
            .success(function (data) {
                deferred.resolve(data);
            }).error(function (data) {
                deferred.reject(data);
            });
            return deferred.promise;
        },
        publish: function (data) {
            var fileTransfer = new FileTransfer();
            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.mimeType = "image/jpeg";
            var targetPath = _host + '/File/UploadImage';

            var defs = [];

            var s = [];
            angular.forEach(data.pic, function (item) {
                if (item) {
                    var deferred = $q.defer();
                    options.fileName = item.substr(item.lastIndexOf('/') + 1);
                    var prex = 'src="';
                    var start, end;
                    fileTransfer.upload(item, targetPath, function (success) {
                        start = success.response.indexOf(prex) + prex.length;
                        end = success.response.indexOf('"', start);
                        s.push(success.response.substring(start, end));
                        deferred.resolve(success);
                    }, function (error) {
                        deferred.reject(error);
                    }, options);
                    defs.push(deferred.promise);
                }
            });

            var deferred = $q.defer();
            $q.all(defs).then(
                function (success) {
                    $http.post(_url + '/PublishCommodity', { title: data.title, description: data.description, price: data.price, contact: data.contact, labels: data.labels, newness: data.newness, maxCount: data.maxCount, place: data.place, tradeEndTime: data.tradeEndTime, pictureUrl: s[0], pictureUrl2: s[1], pictureUrl3: s[2] })
                    .success(function (success) {
                        deferred.resolve(success);
                    }).error(function (error) {
                        deferred.reject(error);
                    });
                },
                function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        },
    };
})

;
