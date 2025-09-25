const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// Hàm gửi request đến API
function sendRequest(method, url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = function () {
        const data = JSON.parse(this.responseText);
        if (this.status >= 200 && this.status < 400) {
            callback(data)
        }
    }
    xhr.send();
};

// Element bài 1
const userIdInput = $("#user-id-input");
const searchUserBtn = $("#search-user-btn");
const userProfileCard = $(".user-profile-card");
const errorMessage = $(".error-message");

// Render User ra giao diện 
function renderUser(data, userID) {
    // Tìm user theo ID
    const user = data.find(u => u.id == userID);

    if (!user) {
        errorMessage.style.display = "block";
        errorMessage.innerHTML = `<p id="user-error-text">Không tìm thấy user với ID: ${userID}</p>`;

        setTimeout(() => {
            errorMessage.style.display = "none";
        }, 2000);
        return;
    }

    // Render thông tin của user được tìm thấy
    userProfileCard.style.display = "block";
    userProfileCard.innerHTML = `
        <div id="user-avatar" class="user-avatar">U</div>
        <div class="user-info">
            <h4 id="user-name" class="user-name">${user.name}</h4>
            <div class="user-details" id="user-details">
                <div class="user-detail-item">
                    <span class="user-detail-label">Email:</span>
                    <span id="user-email">${user.email}</span>
                </div>
                <div class="user-detail-item">
                    <span class="user-detail-label">Phone:</span>
                    <span id="user-phone">${user.phone}</span>
                </div>
                <div class="user-detail-item">
                    <span class="user-detail-label">Website:</span>
                    <span id="user-website">${user.website}</span>
                </div>
                <div class="user-detail-item">
                    <span class="user-detail-label">Company:</span>
                    <span id="user-company">${user.company.name}</span>
                </div>
                <div class="user-detail-item">
                    <span class="user-detail-label">Address:</span>
                    <span id="user-address">${user.address.street}, ${user.address.city}</span>
                </div>
            </div>
        </div>`;
};

// Hàm xử lý tìm user by ID
function handleSearchUserByID() {
    const userID = userIdInput.value;

    if (!userID) {
        errorMessage.style.display = "block";
        errorMessage.innerHTML = `<p id="user-error-text">Vui lòng nhập User ID</p>`;

        setTimeout(() => {
            errorMessage.style.display = "none";
        }, 2000);
        return;
    }

    $("#user-loading").style.display = "block"

    sendRequest("GET", "https://jsonplaceholder.typicode.com/users", (data) => {
        $("#user-loading").style.display = "none"
        renderUser(data, userID);
    });
}

searchUserBtn.addEventListener("click", handleSearchUserByID);

// Element bài 2
const postsList = $(".posts-container");
const loadMorePostBtn = $(".load-more-btn");

function renderPost(data) {
    postsList.innerHTML = data.map(post => {
        return `<div class="post-item" data-post-id="${post.id}">
        <h4 class="post-title">${post.title}</h4>
        <p class="post-body">${post.body}</p>
        <p class="post-author">Tác giả: <span class="author-name">${post.userId}</span></p>
        <button class="show-comments-btn" data-post-id="${post.id}">Xem comments</button>
        <div class="comments-container" data-post-id="${post.id}">
            <!-- Comments sẽ được load động -->
        </div>
    </div>`
    }).join("");

    setTimeout(() => {
        const showCommentBtns = $$(`.show-comments-btn`);
        showCommentBtns.forEach(btn => {
            btn.addEventListener("click", handleShowComment);
        });
    }, 0);
};

function renderComment(data, postId) {
    const commentsContainer = $(`.comments-container[data-post-id="${postId}"]`);

    if (commentsContainer) {
        commentsContainer.innerHTML = data.map(comment => {
            return `
        <div class="comment-item">
            <div class="comment-author">${comment.name}</div>
            <div class="comment-email">${comment.email}</div>
            <div class="comment-body">${comment.body}</div>
        </div>`
        }).join("");
    }
}

function handleShowPost() {
    $("#posts-loading").style.display = "block";
    sendRequest("get", "https://jsonplaceholder.typicode.com/posts?_limit=5", (data) => {
        $("#posts-loading").style.display = "none"
        renderPost(data);
    });
}

function handleShowComment(e) {
    const postId = e.target.dataset.postId;
    const commentsContainer = $(`.comments-container[data-post-id="${postId}"]`);

    // Kiểm tra xem comments đã được load chưa
    if (commentsContainer && commentsContainer.innerHTML.trim() !== '') {
        // Nếu đã có comments, ẩn/hiện
        commentsContainer.style.display = commentsContainer.style.display === 'none' ? 'block' : 'none';
        e.target.textContent = commentsContainer.style.display === 'none' ? 'Xem comments' : 'Ẩn comments';

        sendRequest("GET", `https://jsonplaceholder.typicode.com/posts/${postId}/comments?_limit=3`, (data) => {
            renderComment(data, postId);
        });
        return;
    }
}

// Khi click xem thêm sẽ có 3 post nữa hiện ra
let numberOfPost = 5;
loadMorePostBtn.addEventListener("click", () => {
    numberOfPost += 3;
    $("#posts-loading").style.display = "block"

    sendRequest("get", `https://jsonplaceholder.typicode.com/posts?_limit=${numberOfPost}`, (data) => {
        $("#posts-loading").style.display = "none"
        renderPost(data);
    });
})

// Hiển thị 5 post ngay khi tải trang
handleShowPost();

// Element bài 3
const todoList = $(".todo-list");
const loadTodoBtn = $("#load-todos-btn");
const todoUserIdInput = $("#todo-user-id-input");

const totalTodos = $("#total-todos");
const completedTodos = $("#completed-todos");
const incompleteTodos = $("#incomplete-todos");

const filterBtn = $$(".filter-btn");

function renderToDoList(data, userId) {
    const user = data.find(u => u.userId == userId);

    if (!user) {
        $("#todos-error").style.display = "block";
        $("#todos-error").innerHTML = `<p id="user-error-text">Không tìm thấy user với ID: ${userId}</p>`;
        todoList.style.display = "none";
        setTimeout(() => {
            $("#todos-error").style.display = "none";
        }, 2000);
        return;
    }

    // Render todo list
    todoList.style.display = "grid";
    todoList.innerHTML = data.map(item => {
        return `<div class="todo-item ${item.completed ? "completed" : "incomplete"} " data-todo-id="${userId}" data-completed="">
                        <div class="todo-checkbox"></div>
                        <div class="todo-text">${item.title}</div>
                    </div>`
    }).join("");


    // Hiển thị tổng số Todos
    showTotalTodos(data);

    // Hiển thị số Todos đã hoàn thành và chưa hoàn thành
    showTodosProgress(data);

    if (isTodoListVisible()) {
        enableFilterButtons();
    } else {
        disableFilterButtons();
    }
}

function isTodoListVisible() {
    return todoList.style.display !== "none" &&
        getComputedStyle(todoList).display !== "none";
}

function showTotalTodos(data) {
    totalTodos.innerText = data.length;
    return;
}

function showTodosProgress(data) {
    const completed = data.filter(item => item.completed).length;
    const incomplete = data.length - completed;

    completedTodos.innerText = completed;
    incompleteTodos.innerText = incomplete;
    return;
}

function handleLoadTodoByUserId() {
    const userId = Number(todoUserIdInput.value);

    // Kiểm tra nếu lỗi thì thông báo
    if (!userId) {
        $("#todos-error").style.display = "block";
        $("#todos-error").innerHTML = `<p id="todos-error-text">Vui lòng nhập UserID cần tìm từ 1-10</p>`
        todoList.style.display = "none";
        setTimeout(() => {
            $("#todos-error").style.display = "none";
        }, 2000)

        return;
    };

    $("#todos-loading").style.display = "block";

    // Không lỗi thì render
    todoList.style.display = "grid";
    sendRequest("GET", `https://jsonplaceholder.typicode.com/users/${userId}/todos`, (data) => {
        $("#todos-loading").style.display = "none"
        renderToDoList(data, userId);
    });

    return;
};

loadTodoBtn.addEventListener("click", handleLoadTodoByUserId);

// Filter Todo list
filterBtn.forEach(btn => {
    btn.addEventListener("click", function (e) {
        const userId = Number(todoUserIdInput.value);
        const filter = e.target.dataset.filter;

        filterBtn.forEach(btn => btn.classList.remove("active"));
        this.classList.add("active");

        let url = `https://jsonplaceholder.typicode.com/users/${userId}/todos`
        if (filter === 'completed') {
            url += "?completed=true";
        } else if (filter === "incomplete") {
            url += "?completed=false";
        }

        sendRequest("GET", url, (data) => {
            renderToDoList(data, userId);
        });
    })
});

function disableFilterButtons() {
    $$(".filter-btn").forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.style.cursor = "not-allowed";
    });
}

function enableFilterButtons() {
    $$(".filter-btn").forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
    });
}

disableFilterButtons();