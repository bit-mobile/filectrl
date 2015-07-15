var file = require("modules-common/file/file.js");

var callback;
var uploadingFileList = [];

function upload(param) {
	if (window.starfish) {
		file.upload(param);
	}
}

function openFile(fileInfo) {
	var param = {
		id: fileInfo.id,
		url: global.baseUrl + "/orgs/" + global.data.orgId + "/file/files/" + fileInfo.id + "/attachment",
		mimetype: fileInfo.mimetype,
		name: fileInfo.name,
		size: fileInfo.size
	};

	if (window.starfish) {
		file.openFile(param);
	} else {
		console.log(param);
	}
}

function getState(fn) {
	callback = fn;

	function success(response) {
		var newFinishFileList = [];

		var uploadFileList = response.upload;

		var isError = false;

		$.each(uploadFileList, function(index, obj) {
			if (obj.state === global.UPLOAD_FILE_STATE.FINISH) {
				newFinishFileList.push(obj);
			} else {
				uploadingFileList.push(obj);
			}

			if (obj.state === global.UPLOAD_FILE_STATE.ERROR) {
				isError = true;
			}
		});

		callback({
			isError: isError,
			successFileList: newFinishFileList,
			uploadingFileList: uploadingFileList
		});
	}

	function error(res) {
		callback({
			isError: true
		});
	}
	if (window.starfish) {
		file.getState({
			success: success,
			error: error,
			type: "upload"
		});
	} else {
		startDebug({
			success: success,
			error: error
		});
	}
}

function getNewFileInfo(newFileInfo) {
	var findIndex = -1;

	var isError = false;

	$.each(uploadingFileList, function(index, obj) {
		if (newFileInfo.uuid === obj.uuid) {
			findIndex = index;
			return false;
		}
	});

	var newFinishFileList = [];

	if (findIndex === -1) {
		if (newFileInfo.state === global.UPLOAD_FILE_STATE.FINISH) {
			newFinishFileList.push(newFileInfo);
		} else {
			uploadingFileList.push(newFileInfo);
		}
	} else {
		if (newFileInfo.state === global.UPLOAD_FILE_STATE.FINISH) {
			newFinishFileList.push(newFileInfo);
			uploadingFileList.splice(findIndex, 1);
		} else {
			uploadingFileList[findIndex] = newFileInfo;
		}
	}

	if (newFileInfo.state === global.UPLOAD_FILE_STATE.ERROR) {
		isError = true;
	}

	callback({
		isError: isError,
		successFileList: newFinishFileList,
		uploadingFileList: uploadingFileList
	});
}

function remove(fileInfo) {
	var findIndex = -1;

	$.each(uploadingFileList, function(index, obj) {
		if (fileInfo.uuid === obj.uuid) {
			findIndex = index;
			return false;
		}
	});

	if (findIndex > -1) {
		uploadingFileList.splice(findIndex, 1);
	}
}

function startDebug(param) {
	// param.error(); // 测试网络出错的情况
	var uploadList = [];
	uploadList.push({
		uuid: 124,
		name: "test.mp3",
		extra: {
			parent: "/"
		},
		httpData: {
			errcode: 0,
			data: {
				id: 555,
				date_updated: 1399517210,
				fullpath: "/test.mp3",
				is_file: 1,
				mimetype: "image/jpeg",
				name: "test.mp3",
				parent: 0,
				size: 3424
			}
		},
		isDirectory: false,
		size: 23443444,
		fileId: 551234,
		progress: 12,
		state: 4
	});
	param.success({
		upload: uploadList
	});
}

module.exports = {
	upload: upload,
	getState: getState,
	getNewFileInfo: getNewFileInfo,
	openFile: openFile,
	remove: remove
};