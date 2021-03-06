// Generated by CoffeeScript 1.10.0
(function() {
  var factory;

  factory = function($q) {
    var Hash;
    return Hash = (function() {
      Hash.prototype._result = null;

      Hash.prototype._finalized = null;

      Hash.prototype._file = null;

      Hash.prototype._chunkSize = null;

      Hash.prototype._fileSize = null;

      Hash.prototype._totalChunks = null;

      Hash.prototype._chunkIndex = null;

      Hash.prototype._lastProgress = null;

      Hash.prototype._bytesPassed = null;

      Hash.prototype._spark = null;

      function Hash() {
        this._spark = new SparkMD5.ArrayBuffer();
        this._finalized = false;
        this._bytesPassed = 0;
      }

      Hash.prototype.update = function(data) {
        this._bytesPassed += data.byteLength;
        this._spark.append(data);
        return this;
      };

      Hash.prototype.digest = function() {
        this._result = this._spark.end();
        this._finalized = true;
        return this._progressListeners = null;
      };

      Hash.prototype.getResult = function() {
        if (!this._finalized) {
          throw new Error('Not finalized');
        }
        return this._result;
      };

      Hash.prototype.onProgress = function(progress) {};

      Hash.prototype.hashFile = function(file, chunkSize) {
        if (chunkSize == null) {
          chunkSize = 65536;
        }
        this._file = file;
        this._fileSize = file.size;
        this._chunkSize = chunkSize;
        this._totalChunks = Math.ceil(this._fileSize / this._chunkSize);
        this._chunkIndex = 0;
        this._lastProgress = 0;
        return this._performHashing();
      };

      Hash.prototype._performHashing = function() {
        return $q((function(_this) {
          return function(resolve, reject) {
            var callback, criteria, iterator;
            criteria = function() {
              return _this._chunkIndex < _this._totalChunks;
            };
            iterator = function(cb) {
              var end, start;
              start = _this._chunkIndex * _this._chunkSize;
              end = Math.min(start + _this._chunkSize, _this._fileSize);
              if (start >= _this._fileSize) {
                _this._chunkIndex += 1;
                return cb();
              }
              _this._readFileChunk(start, end).then(function(arrayBuffer) {
                _this.update(arrayBuffer);
                _this._progress();
                _this._chunkIndex += 1;
                return cb();
              })["catch"](function(err) {
                if (err == null) {
                  err = new Error('Ooops, something went wrong');
                }
                console.log('error');
                return cb(err);
              });
            };
            callback = function(err) {
              if (err) {
                return reject(err);
              } else {
                _this.digest();
                return resolve(_this._result);
              }
            };
            async.whilst(criteria, iterator, callback);
          };
        })(this));
      };

      Hash.prototype._readFileChunk = function(start, end) {
        return $q((function(_this) {
          return function(resolve, reject) {
            var reader;
            reader = new FileReader();
            reader.onloadend = function(event) {
              if (event.target.readyState !== FileReader.DONE) {
                return false;
              }
              return resolve(event.target.result);
            };
            reader.onerror = function(err) {
              return reject(err);
            };
            reader.readAsArrayBuffer(_this._file.slice(start, end));
          };
        })(this));
      };

      Hash.prototype._progress = function() {
        var currentProgress;
        currentProgress = Math.floor(100 / this._totalChunks * (this._chunkIndex + 1));
        if (typeof this.onProgress === 'function' && currentProgress !== this._lastProgress) {
          this.onProgress(currentProgress);
        }
        this._lastProgress = currentProgress;
      };

      return Hash;

    })();
  };

  angular.module('cynny').factory('MD5', ['$q', factory]);

}).call(this);
