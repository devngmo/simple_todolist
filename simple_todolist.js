let app = new Vue({
    el: '#app',
    data: function() {
        return {
            task: { title: '' },
            tasks: [],
            active_list: 'todos',
            todos: [],
            archived: [],
            new_task: ''
        };
    },
    created: function() {
        this.todos = [];
        this.archived = [];
        SandboxStorage.onCollection('tasks').get().then(resp => {
            resp.data.map(t => {
                if (t['archived']) app.archived.push(t);
                else app.todos.push(t);
            });
            
            app.tasks = app.todos;
        });
    },
    computed: {
        active_list_name: function() {
            if (this.active_list === 'todos') return 'Todos';
            return 'Archived';
        }
    },
    methods: {
        toggleList: function() {
            if (this.active_list === 'todos') {
                this.active_list = 'archived';
                this.tasks = this.archived;
                
            } else {
                this.active_list = 'todos';
                this.tasks = this.todos;
            }
        },            
        
        onClickTaskAt: function(idx) {
            let task = this.tasks[idx];
            
            if (this.active_list === 'todos') {
                if (task['status'] === 'done')
                    task['status'] = 'new';
                else if (task['status'] === 'new')
                    task['status'] = 'urgent';
                else if (task['status'] === 'urgent')
                    task['status'] = 'done';
                
                SandboxStorage.onCollection('tasks').doc(task._id).save( task );
            }
            else {
                task['archived'] = false;
                SandboxStorage.onCollection('tasks').doc(task._id).save( task ).then(resp => { 
                    app.todos.push(task);
                    app.archived.splice(idx, 1);
                    app.tasks = app.archived;                    
                    $.notify('Task was Restored', 'success', {
                        autoHide: true,
                        autoHideDelay: 1000
                    });
                 });
            }
            
        },
        archiveAt: function(idx) {
            let task = this.tasks[idx];
            task['archived'] = true;
            SandboxStorage.onCollection('tasks').doc(task._id).save( task ).then(resp => { 
                app.todos.splice(idx, 1);
                app.archived.push(task);
                app.tasks = app.todos;
                $.notify('Task was Archived', 'success', {
                    autoHide: true,
                    autoHideDelay: 1000
                });
             });
        
        },
        add: function() {
            let newTask = { _id: null, title: this.new_task };
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
            if (this.task._id === null) { // add new TASK
                let newTask = this.task;
                
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
            this.task = { _id: null, title: ''};
            $('#dlg-task-edit').modal('show');
        }
    }
});