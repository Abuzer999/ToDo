const buttonAdd = document.querySelector('.todo__add');
const inp = document.querySelector('.todo__center input');
const tasks = document.querySelector('.todo__tasks');
const form = document.querySelector('.todo__center');
const taskAll = document.querySelector('.todo__all');
const completed = document.querySelector('.todo__completed')
const nothing = document.querySelector('.todo__nothing');
const dones = document.querySelector('.todo__dones');

const api = 'https://660c23b83a0766e85dbd8283.mockapi.io/tasks';

const dataGet = async () => {
    try {
        const response = await axios.get(api);
        const data = await response.data;
        empty(data)
        console.log(data);
        addTask(data);
    } catch(error) {
        console.warn('error:', error);
    }
}

const dataPost = async () => {
    const input = inp.value;
    if (!inp.value || inp.value.trim() === '') return;

    try {
        const response = await axios.post(api, {text: input, done: false});
        await dataGet();
        const taskId = response.data.id;
        animateTask(taskId);
        console.log('задача добавлена:')
    } catch(error) {
        console.warn('error:', error);
    }
}

const deleteData = async (id) => {
    try {
        await axios.delete(`${api}/${id}`);
        const task = document.querySelector(`.todo__task[id="${id}"]`);
        delTask(task);
        await dataGet(); 
        console.log('задача удалена:')
    } catch(error) {
        console.warn('error:', error);
    }
    
}

const patchData = async (id, doneStatus) => {
    try {
        await axios.put(`${api}/${id}`, { done: doneStatus });
        await dataGet();
        const task = document.querySelector(`.todo__task[id="${id}"]`);
        checkAni(task, doneStatus);
        console.log('Задача обновлена:');
    } catch(error) {
        console.warn('error:', error);
    }
}

const updateText = async (id, newText) => {
    try {
        await axios.put(`${api}/${id}`, { text: newText });
        await dataGet();
        console.log('Текст задачи обновлен:');
    } catch(error) {
        console.warn('error', error);
    }
}

const addTask = (task) => {

    tasks.innerHTML = '';

    task.filter(task => !task.done).forEach(el => {
        const taskHTML = createTask(el);
        tasks.insertAdjacentHTML('afterbegin', taskHTML);
    });

    task.filter(task => task.done).forEach(el => {
        const taskHTML = createTask(el);
        tasks.insertAdjacentHTML('beforeend', taskHTML);
    });

 
    inp.value = '';
    
}

const createTask = (task) => {
    return `
        <div class="todo__task ${task.done ? 'done' : ''}" id="${task.id}">
            <label class="todo__custom-checkbox">
                <input ${task.done ? 'checked' : ''} type="checkbox" value="value-1">
                <span></span>
            </label>
            <p>${task.text}</p>
            <div class="todo__edit">
                <img src="./icon/pensil.svg" alt="svg">
            </div>
            <div class="todo__del">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 13 14">
                    <path fill="gray" d="M8.202 4.985h-1.33v5.522h1.33V4.985Zm-2.74 0h-1.33v5.522h1.33V4.985Z"/>
                    <path fill="gray" d="M12.478 2.167a.644.644 0 0 0-.46-.605.62.62 0 0 0-.184-.045H8.287a2.144 2.144 0 0 0-4.1 0H.638a.641.641 0 0 0-.172.027H.452a.641.641 0 0 0 .09 1.246l.711 9.743A1.512 1.512 0 0 0 2.683 14h7.104a1.512 1.512 0 0 0 1.433-1.467l.708-9.734a.638.638 0 0 0 .55-.632Zm-6.241-.952a.937.937 0 0 1 .689.302H5.547a.932.932 0 0 1 .69-.302Zm3.55 11.575H2.683c-.081 0-.208-.133-.223-.344L1.758 2.81h8.957l-.701 9.635c-.016.211-.143.344-.227.344Z"/>
                </svg>
            </div>
        </div>
    `;
    
}

const empty = (data) => {
    const completedTasks = data.filter(task => task.done).length;
    taskAll.setAttribute('data-task', data.length);
    completed.setAttribute('data-completed', `${completedTasks} из ${data.length}`)
    if(data.length === 0) {
        nothing.classList.remove('none')
    } else {
        nothing.classList.add('none')
    }
}


form.addEventListener('click', (e) => {
    e.preventDefault();
    dataPost();
})

tasks.addEventListener('click', (e) => {
    const taskElement = e.target.closest('.todo__task');
    const textTask = taskElement.querySelector('p');

    if(e.target.closest('.todo__del')){ 
        const taskId = taskElement.id;
        deleteData(taskId);
    }

    if (e.target.closest('.todo__edit')) {
        const inputElement = textTask.querySelector('input');
        if (inputElement && inputElement.value.length > 0) {
            const newText = inputElement.value.trim();
            textTask.innerHTML = newText;
            taskElement.classList.remove('edit');
            updateText(taskElement.id, newText);
        }
    }

    if(e.target === textTask) {
        taskElement.classList.add('edit');
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.value = textTask.innerText.trim();
        textTask.innerHTML = '';
        textTask.appendChild(inputField);
        inputField.focus();


        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && inputField.value.length > 0) {
                const newText = inputField.value.trim();
                textTask.innerHTML = newText;
                taskElement.classList.remove('edit');
                updateText(taskElement.id, newText);
            }
        });
    }
    
});

document.addEventListener('change', (e) => {
    const taskElement = e.target.closest('.todo__task');
    const checkbox = e.target.closest('.todo__custom-checkbox');

    if (checkbox) {
        const taskId = taskElement.id;
        let check = checkbox.querySelector('input').checked;

        if(check) {
            check = true;
        } else {
            check = false;
        }
        
        patchData(taskId, check);
    }
})

dataGet();

//animation

function createStars() {
    let count = 100;
    let loader = document.querySelector('.loader');
    if (!loader) return;
    let i = 0;

    gsap.fromTo('.loader__rocket', { y: 2 }, {
        y: -2,
        repeat: -1,
        duration: 0.2,
    });

    loader.querySelectorAll('i').forEach(function(star) {
        star.remove();
    });

    while (i < count) {
        let star = document.createElement('i');
        let x = Math.floor(Math.random() * window.innerWidth);

        let duration = Math.random() * 1;
        let h = Math.random() * 50;

        star.style.left = x + 'px';
        star.style.width = 1 + 'px';
        star.style.height = h + 'px';

        loader.appendChild(star);

        gsap.to(star, {
            duration: duration,
            y: window.innerHeight,
            repeat: -1,
            ease: "power1.inOut"
        });

        i++;
    }
}

window.addEventListener('load', () => {
    createStars();
    setTimeout(() => {

        dataGet().then(() => {
            gsap.killTweensOf('.loader i');
            gsap.to('.loader', {
                opacity: 0,
                duration: 0.2,
                onComplete: function() {
                    document.querySelector('.loader').style.display = 'none';
                }
            });
        });
    }, 1500);
});

function animateTask(id) {
    const taskElement = document.querySelector(`.todo__task[id="${id}"]`);
    gsap.fromTo(taskElement, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.3 });
}

function delTask(task) {
    gsap.to(task, { opacity: 0, scale: 0, duration: 0.5 });
}

function checkAni(taskElement, checked) {
    if(checked) {
        gsap.fromTo(taskElement, {scale: 0, opacity: 0}, {
            scale: 1,
            opacity: 1,
            duration: 0.3,
        });
    } else {
        gsap.fromTo(taskElement, {scale: 0, opacity: 0}, {
            scale: 1,
            opacity: 1,
            duration: 0.3,
        });
    }
}

