let app = new Vue({
    el: '#app',
    data: function() {
        return {
            task: { id: '', title: '' },
            tasks: [],
            new_task: ''
        };
    },
    created: function() {
        SandboxStorage.onCollection('tasks').get().then(resp => {
            app.tasks = resp.data;
        });
    },
    methods: {
        deleteAt: function(idx) {
            let task = this.tasks[idx];
            SandboxStorage.onCollection('tasks').doc(task._id).delete().then(resp => { 
                app.tasks.splice(idx, 1);
                $.notify('Task was deleted', 'success', {
                    autoHide: true,
                    autoHideDelay: 1000
                });
             });
        },
        add: function() {
            let newTask = { _id: null, id: guid(), title: this.new_task };
            // check duplicated
            for (let i = 0; i < this.tasks.length; i++) {
                const t = this.tasks[i];
                if (t.title.trim().toLowerCase() === newTask.title.trim().toLowerCase()) {
                    $.notify('Task was duplicated', 'warning', {
                        autoHide: true,
                        autoHideDelay: 1000
                    });
                    return;
                }
            }
            SandboxStorage.onCollection('tasks').add(newTask).then(resp => {
                newTask._id = resp.data; // update document ID in collection from server response
                this.tasks.push(newTask);
            });
        },
        save: function() {
            if (this.task.id === null) { // add new TASK
                let newTask = this.task;
                this.task.id = guid(); // create user defined TASK ID
                
                SandboxStorage.onCollection('tasks').add(this.task).then(resp => {
                    newTask._id = resp.data; // update document ID in collection from server response
                    app.tasks.push(newTask);
                });
            }
            else { // Update TASK
                let updatedTask = this.task;
                SandboxStorage.onCollection('tasks').add(updatedTask).then(resp => {
                    $.notify('Task was updated', 'success', {
                        autoHide: true,
                        autoHideDelay: 1000
                    });
                });
            }
        },
        showAddDialog: function() {
            this.task = { _id: null, id: null, title: ''};
            $('#dlg-task-edit').modal('show');
        }
    }
});