document.addEventListener('DOMContentLoaded', function() {

    if (window.location.pathname === "/") {

        // Nav bar buttons to toggle between views
        document.querySelector('#all').addEventListener('click', event => {
            event. preventDefault();
            load_posts_view('all', 1);
        });

        btn_follow = document.querySelector('#followed');
        if (btn_follow != null) {
            btn_follow.addEventListener('click', event => {
                event. preventDefault()
                load_posts_view('followed', 1);
            });
        }
        
        // By default, load the all view first page
        load_posts_view('all', 1);
    
    }
    else {
           
        document.querySelector('.main-nav').style.display = 'none';
        const profile_id = document.querySelector('#hidden_info').innerHTML;
        const follow_btn = document.querySelector('#follow_btn');
        if (follow_btn != null) {
            follow_btn.addEventListener('click', event => follow_user(event, profile_id, 0));
        }

        // By default, load the first page
        load_user_posts(profile_id, 1);
            
    }
    
});

function get_token(url) {
    
    //Get token from DOM
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    const request = new Request(
        url,
        {headers: {'X-CSRFToken': csrftoken}}
    );
    return request;

}

function load_posts_view(page, counter) {

    if (page === 'all') {

        console.log('is all');        
        // Show the page name
        document.querySelector('h3').innerHTML = 'All Posts';
        // Show the new_post section
        document.querySelector('#new-post').style.display = 'block'; 
    }

    else {
        console.log('is follow');
        // Show the page name
        document.querySelector('h3').innerHTML = 'Posts of people you follow';
        // if page == followed, hide the new_post section
        document.querySelector('#new-post').style.display = 'none';
    }

    // Clean old data from section
    document.querySelector('#posts-view').innerHTML = '';

    // Load posts
    fetch(`/posts/${page}/${counter}`)
    .then(response => response.json())
    .then(posts => {
        console.log(posts.pagination.total_pages)
        paginator(posts.pagination);
        // Create posts
        posts.posts.forEach(post => generate_post(post));        
    });

}

function generate_post(post) {

    // Create post
    // Post container
    const container = document.createElement('div');
    container.className = 'card';

    // User
    const user = document.createElement('h5');
    user.className = 'card-header';
    user.innerHTML = `<a class="nav-link card_username" href="/profile/${post.user[0]}">${post.user[1]}</a>`;
    container.append(user);

    // Inner container (card body)
    const inner_container1 = document.createElement('div');
    inner_container1.className = 'card-body post_body';

    // Inner container (for post edition)
    const inner_containerEd = document.createElement('div');
    inner_containerEd.className = 'card-body edit_post';
    inner_containerEd.style.display = 'none';

    // Content of the post
    if (post.actual_user === post.user[0]) {
        const edit = document.createElement('button');
        edit.className = 'btn btn-sm btn-outline-primary edit_btn';
        edit.innerHTML = 'Edit';
        edit.addEventListener('click', event => edit_post(event, post));
        inner_container1.append(edit);
    }
    const content = document.createElement('p');
    content.className = 'post-itself';
    content.innerHTML = post.post_cont;
    const date = document.createElement('p');
    date.style.color = 'grey';
    date.style.fontSize = 'small';
    date.innerHTML = post.dt_hr;

    inner_container1.append(content, date)

    // Inner container (card footer)
    const inner_container2 = document.createElement('div');
    inner_container2.className = 'card-footer';

    // Like button
    const like_btn = document.createElement('i');
    const likes_count = post.likes.length;
    let i = 0;
    do {           
        if (post.likes[i] === post.actual_user) {
            like_btn.className = 'fa fa-heart';
            like_btn.style.color = 'red';
        }
        else {
            like_btn.className = 'fa fa-heart-o';
        }
        i++;
    }
    while (i < likes_count);
    like_btn.style.cursor = 'pointer';
    // Bloking like function for not loged users (client-side)
    if (post.actual_user !== null) {
        like_btn.addEventListener('click', event => like_post(post, event));
    }        
    
    // Likes count
    const number_of_likes = document.createElement('i');
    number_of_likes.className = 'likes_counter';
    number_of_likes.innerHTML = likes_count;
            
    inner_container2.append(like_btn, number_of_likes);

    container.append(inner_container1, inner_containerEd, inner_container2);
    container.style.marginTop = "5px";
    
    document.querySelector('#posts-view').append(container);

}

function like_post(post, event) {
    
    const request = get_token(`/post/${post.id}`);
    const like_counter = event.target.parentElement.children[1];

    if (event.target.className === 'fa fa-heart') {
        var message = false;
        event.target.className = 'fa fa-heart-o';
    }
    else if (event.target.className === 'fa fa-heart-o') {
        var message = true;
        event.target.className = 'fa fa-heart';
        event.target.style.color = 'red';
    }

    fetch(request, {
        method: 'PUT',
        body: JSON.stringify({
            likes: message
        })
    })
    .then(response => response.json())
    .then(count =>{
        like_counter.innerHTML = '';
        like_counter.innerHTML = count;            
    });

}

function edit_post(event, post) {

    // White backgorund for bootstrap button
    event.target.style.backgroundColor = 'white';
    event.target.style.boxShadow = 'none';

    // Hide Post
    const post_container = event.target.parentElement;
    post_container.style.display = 'none';

    // Display edition container
    const main_container = post_container.parentElement;
    const list_of_containers = main_container.children;
    list_of_containers[2].style.display = 'block';
    
    // Append content

    // Create a back/exit edition button
    const back_btn = document.createElement('i');
    back_btn.className = 'back_btn fa fa-arrow-left';
    back_btn.addEventListener('click', () => {
        list_of_containers[2].innerHTML = '';
        list_of_containers[2].style.display = 'none';
        post_container.style.display = 'block';
    })

    const txt_input = document.createElement('textarea');
    txt_input.id = 'edited_post';
    txt_input.rows = '2';
    txt_input.style.width = '100%';

    const edit_btn_sbmt = document.createElement("button");
    edit_btn_sbmt.className = 'edit_btn_sbmt btn btn-primary btn-sm'; 
    edit_btn_sbmt.innerHTML = 'Edit post';
    edit_btn_sbmt.addEventListener('click', () => submit_edition(post, list_of_containers))
    
    list_of_containers[2].append(back_btn, txt_input, edit_btn_sbmt);

}

function submit_edition(post, containers) {

    const request = get_token(`/post/${post.id}`);
    const edited_post = containers[2].children[1].value;
    const post_container = containers[1].children[1];

    fetch(request, {
        method: 'PUT',
        body: JSON.stringify({
            post_content: edited_post
        })
    })
    .then(response => response.json())
    .then(post =>{
        containers[2].innerHTML = '';
        containers[2].style.display = 'none';
        containers[1].style.display = 'block';
        post_container.innerHTML = '';
        post_container.innerHTML = post.post_cont;
    });

}

function follow_user(event, id, counter) {

    const request = get_token(`/info/${id}/${counter}`);
    event.target.innerHTML = '';
    const followers_count = document.querySelector('#followers');
    
    if (event.target.className === 'btn btn-outline-primary ufllw') {
        var message = false;
        event.target.className = 'btn btn-primary fllw';
        event.target.innerHTML = 'Follow';
    }
    else if (event.target.className === 'btn btn-primary fllw') {
        var message = true;
        event.target.className = 'btn btn-outline-primary ufllw';
        event.target.innerHTML = 'Unfollow';
    }

    fetch(request, {
        method: 'PUT',
        body: JSON.stringify({
            follow: message
        })
    })
    .then(response => response.json())
    .then(count =>{
        followers_count.innerHTML = '';
        followers_count.innerHTML = `${count}<br>Followers`;            
    });

}

function load_user_posts(id, counter) {

    // Clean old data from section
    document.querySelector('#posts-view').innerHTML = '';

    // Load posts
    fetch(`/info/${id}/${counter}`)
    .then(response => response.json())
    .then(posts => {
        paginator(posts.pagination);
        // Create posts
        posts.posts.forEach(post => generate_post(post));        
    });

}

function paginator(pagination) {

    const page_number = document.querySelector('#page_number');
    page_number.innerHTML = '';
    page_number.innerHTML = pagination.page;

    const previous = document.querySelector('#previous');
    previous.innerHTML = '';
    const next = document.querySelector('#next');
    next.innerHTML = '';

    if (pagination.page > 1 && pagination.page <= pagination.total_pages) {
        const previous_btn = document.createElement('button')
        previous_btn.className = 'page-link previous_btn';
        previous_btn.addEventListener('click', () => change_page(pagination.from, 'previous'));
        previous_btn.innerHTML = '<span aria-hidden="true">&laquo;</span><span class="sr-only">Previous</span>';
        previous.append(previous_btn);
    }
    
    if (pagination.page >= 1 && pagination.page < pagination.total_pages) {
        const next_btn = document.createElement('button');
        next_btn.className = 'page-link next_btn';
        next_btn.addEventListener('click', () => change_page(pagination.from, 'next'));
        next_btn.innerHTML = '<span aria-hidden="true">&raquo;</span><span class="sr-only">Next</span>';
        next.append(next_btn);
    }

}

function change_page(from, action) {

    const page_number = document.querySelector('#page_number').innerHTML;

    if (action === 'previous') {
        var new_page = parseInt(page_number) - 1;
    }
    else {
        var new_page = parseInt(page_number) + 1;
    }
    
    if (from === 'profile') {
        const profile_id = document.querySelector('#hidden_info').innerHTML;
        load_user_posts(profile_id, new_page);        
    }
    else {
        load_posts_view(from, new_page);
    }
    
}