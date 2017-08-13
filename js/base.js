;(function() {
	'use strict';

	var $formAddTask = $('.add-task');
	
	var taskList = [];

	init();

	$formAddTask.on('submit', function(e) {
		var newTask = {};
		newTask.content = $(this).find('input[name=text]').val();
		newTask.isCompleted = false;

		if(!newTask.content) return;
		
		if(addTask(newTask)) {
			$(this).find('input[name=text]').val('');
			$(this).find('input[name=text]')[0].focus();
		}
		
		e.preventDefault();
	});

	$('.task-list').on('click', function(e) {
		var index = getSelectedItemIndex(e.target);

		if(e.target.className === 'delete' && index !== undefined) {
			var tmp = confirm('确定删除吗？');
			tmp ? deleteTask(index) : null;
		}

		if(e.target.className === 'detail' && index !== undefined) {
			showTaskDetail(index);
		}
	});

	$('.task-detail-mask').on('click', function(e) {
		hideTaskDetail();
	});

	$(document).on('change', '.is-completed', function(e) {
		var $taskItem = $('.task-item');
		var index = getSelectedItemIndex(e.target);
		
		if(this.checked) {
			taskList[index]['checked'] = true;
			var tmp = taskList.splice(index, 1)[0];
			taskList.push(tmp);
		} else {
			taskList[index]['checked'] = false;
			var tmp = taskList.splice(index, 1)[0];
			taskList.unshift(tmp);
		}
		store.set('taskList', taskList);
		renderTaskList();
	})

	function initEndTime() {
		var endTime = new Date();
		endTime.setMinutes(endTime.getMinutes() + 30);
		return Date.parse(endTime.toString());
	}

	function showTaskDetail(index) {
		var $taskDetail = $('.task-detail');
		var $taskDetailMask = $('.task-detail-mask');

		updateTaskDetailData(index);

		$taskDetail.show();
		$taskDetailMask.show();

		$('.task-detail').off();
		$('.task-detail').on('submit', function(e) {
			var data = getTaskDetailData();

			updateTask(index, data);
			$taskDetailMask.trigger('click');
			e.preventDefault();
		});
	}

	function updateTaskDetailData(index) {
		var $taskDetail = $('.task-detail');

		taskList[index].content ? $taskDetail.find('.content input').val(taskList[index].content)
								: $taskDetail.find('.content input').val('');
		taskList[index].desc ? $taskDetail.find('.desc textarea').val(taskList[index].desc)
							 : $taskDetail.find('.desc textarea').val('');
		
		$taskDetail.find('.remind .begin').val(taskList[index].beginTime)
		$taskDetail.find('.remind .end').val(taskList[index].endTime);
	}

	function getTaskDetailData() {
		var data = {};
		var $taskDetail = $('.task-detail');

		data.content = $taskDetail.find('.content input').val();
		data.desc = $taskDetail.find('.desc textarea').val();
		data.beginTime = $taskDetail.find('.remind .begin').val();
		data.endTime = $taskDetail.find('.remind .end').val();

		return data;
	}


	function hideTaskDetail() {
		$('.task-detail-mask').hide();
		$('.task-detail').hide();
	}

	function getSelectedItemIndex(target) {
		var $taskItem = $('.task-item');
		var index;
		for(var i = 0; i < $taskItem.length; i++) {
			if($($taskItem[i]).find($(target)).length === 1) {
				index = i;
			}
		}
		return index;
	}

	function renderTaskItem(data) {
		var listItemTpl1 = `<div class="task-item task-item-completed">
						<span>
							<input type="checkbox" class="is-completed" checked>
						</span>
						<span class="task-content">${data.content}</span>
						<span class="fr">
							<span class="delete">删除</span>
							<span class="detail">详细</span>
						</span>
					</div>`;
		var listItemTpl2 = `<div class="task-item">
						<span>
							<input type="checkbox" class="is-completed">
						</span>
						<span class="task-content">${data.content}</span>
						<span class="fr">
							<span class="delete">删除</span>
							<span class="detail">详细</span>
						</span>
					</div>`;

		var listItemTpl = data.checked ? listItemTpl1 : listItemTpl2;
		return $(listItemTpl);
	}

	function renderTaskList() {
		var $taskList = $('.task-list');
		$taskList.html('');
		for (var i = 0; i < taskList.length; i++) {
			var $task = renderTaskItem(taskList[i]);
			$taskList.append($task);
		}
	}

	function updateTask(index, data) {	
		taskList[index] = $.extend({}, taskList[index], data);
		store.set('taskList', taskList);
		renderTaskList();
	}

	function addTask(newTask) {
		console.log(newTask);
		taskList.unshift(newTask);
		store.set('taskList', taskList);
		renderTaskList();
		return true;
	}
	
	function deleteTask(index) {
		if(index === undefined || !taskList[index]) return;
		taskList.splice(index, 1);
		store.set('taskList', taskList);
		renderTaskList();
	}

	function init() {
		taskList = store.get('taskList') || [];
		console.log(taskList);
		if(taskList.length)	renderTaskList();
	}
})();