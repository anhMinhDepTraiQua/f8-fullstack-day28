// 1.1. Tạo utility function để gọi API với XHR
function sendRequest(method, url, callback) {
    const xhr = new XMLHttpRequest;
    xhr.open(method,url,true) // true cho bất đồng bộ
    xhr.send()// thao tác gửi yêu cầu
    xhr.onload = function(){
        if(xhr.status >=200 && xhr.status < 400){ // khi thành công 
            callback(null,xhr.responseText);
        }
        else { //khi lỗi
            
            callback("error",null)
        }
    }
    xhr.onerror = function(){
        callback("error",null)
    }
}
//1.2. Implement 3 chức năng sử dụng JSONPlaceholder API
//Chức năng 1: User Profile Card
const userIdInput = document.querySelector("#user-id-input");
const searchUserBtn = document.querySelector("#search-user-btn");
const userProfileCard = document.querySelector("#user-profile-card");
const userAvatar = document.getElementById("user-avatar");
const userName = document.querySelector("#user-name");
const userEmail = document.querySelector("#user-email");
const userPhone = document.querySelector("#user-phone");
const userWebsite = document.querySelector("#user-website");
const userCompany = document.querySelector("#user-company");
const userAddress = document.querySelector("#user-address");
const userError = document.querySelector("#user-error");
const userLoading = document.querySelector("#user-loading");

const API = "https://jsonplaceholder.typicode.com/users/";// API chung 
searchUserBtn.addEventListener("click",()=>{
    sendRequest(`GET`,`${API}${userIdInput.value}`,(error,data)=>{
        user = JSON.parse(data);
        if(error===null){
            console.log(data)
             // Hiện card
            userProfileCard.classList.add("show");
            userAvatar.textContent = user.name.charAt(0); // Lấy ký tự đầu tiên
            userName.textContent = user.name;
            userEmail.textContent = user.email;
            userPhone.textContent = user.phone;
            userWebsite.textContent = user.website;
            userCompany.textContent = user.company.name;
            userAddress.textContent = `${user.address.street}, ${user.address.city}`;
        }
        else{
            userError.classList.add("show");
            userError.textContent = `Lỗi: ${error.message}`;
            return;
        }
    });
});
//Chức năng 2: Posts với Comments
const postsContainer = document.querySelector("#posts-container");
const postsError = document.querySelector("#posts-error");
const postItemTemplate = document.querySelector(".post-item[data-post-id='']"); // template
const postsLoading = document.querySelector("#posts-loading");

// ...existing code...
sendRequest(`GET`,`https://jsonplaceholder.typicode.com/posts?_limit=20`,(error,data1)=>{
    const posts = JSON.parse(data1);
    if(error===null){
        console.log(posts)
        // Render 5 post đầu tiên
        const firstPosts = posts.slice(0,5);
        const postsHtml = firstPosts.map(post => `
            <div class="post-item" data-post-id="${post.id}">
                <h3>${post.title}</h3>
                <p>${post.body}</p>
            </div>
        `).join('');
        postsContainer.innerHTML = postsHtml;

        // Tạo nút xem thêm nếu còn post
        if(posts.length > 5){
            const showMoreBtn = document.createElement('load-more-btn');
            showMoreBtn.id = 'show-more-posts';
            showMoreBtn.style.display()
            postsContainer.appendChild(showMoreBtn);

            showMoreBtn.addEventListener('click', () => {
                const morePostsHtml = posts.slice(5).map(post => `
                    <div class="post-item" data-post-id="${post.id}">
                        <h3>${post.title}</h3>
                        <p>${post.body}</p>
                    </div>
                `).join('');
                postsContainer.innerHTML += morePostsHtml;
                showMoreBtn.remove();
            });
        }
    }
    else{
        postsError.classList.add("show");
    }
})
// ...existing code...
