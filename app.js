const BASE_URL = "https://jsonplace-univclone.herokuapp.com";
function fetchData(url) {
    return fetch(url)
      .then(function (response) {
        return response.json();
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  function fetchUsers() {
    return fetchData(`${BASE_URL}/users`);
  }

// function fetchUserAlbumList(userId) {
//   return fetchData(`${ BASE_URL }/users/${ userId }/albums?_expand=user&_embed=photos`);
// }


function renderUser(user) {
    return $(`
   <div class="user-card">
  <header>
    <h2>${user.name}</h2>
  </header>
  <section class="company-info">
    <p><b>Contact:</b>${user.email}</p>
    <p><b>Works for:</b> ${user.company.name}</p>
    <p><b>Company creed:</b> ${user.company.catchPhrase}, which will ${user.company.bs}!"</p>
  </section>
  <footer>
    <button class="load-posts">Posts by ${user.username}</button>
    <button class="load-albums">Albums by ${user.username}</button>
  </footer>
</div>
    `).data("user", user)
}

function renderUserList(userList) {
    console.log(userList);
    $('#user-list').empty();
    userList.forEach(function (user) {
        $('#user-list').append(renderUser(user));
    });
}


function bootstrap() {
    fetchUsers().then(renderUserList);
}
bootstrap();



$('#user-list').on('click', '.user-card .load-posts', function () {
    const user = $(this).closest(".user-card").data("user");
    fetchUserPosts(user.id).then(renderPostList);
});
   
$('#user-list').on('click', '.user-card .load-albums', function () {
     const user = $(this).closest(".user-card").data("user");
     fetchUserAlbumList(user.id).then(renderAlbumList);
});




/* get an album list, or an array of albums */
function fetchUserAlbumList(userId) {
    return fetch(`${ BASE_URL }/users/${userId}/albums?_expand=user&_embed=photos`).then(function (response) {
        // convert from JSON to an object, and return
        return response.json()
    }).catch(function (error) {
    console.error(error);
    })
}

fetchUserAlbumList(1).then(function (albumList) {
  console.log(albumList);
});

/* render a single album */
function renderAlbum(album) {
    let albumCard = $(`
    <div class="album-card">
    <header>
    <h3>${album.title}, by ${album.user.username} </h3>
    </header>
  <section class="photo-list">
    <div class="photo-card"></div>
    <div class="photo-card"></div>
    <div class="photo-card"></div>
    <!-- ... -->
  </section>
</div>
`);
    album.photos.forEach(function(photo) {
        $('.photo-list').append(renderPhoto(photo));
    });
    return albumCard;
}

/* render a single photo */
function renderPhoto(photo) {
    return $(`
    <div class="photo-card">
  <a href="${photo.url}" target="_blank">
    <img src="${photo.thumbnailUrl}">
    <figure>${photo.title}</figure>
  </a>
</div>
`);
}

/* render an array of albums */
function renderAlbumList(albumList) {
    $('#app section.active').removeClass('active');
    $('#album-list').empty();
    $('#album-list').addClass('active');
    

    albumList.forEach(function(album) {
        $('#album-list').append(renderAlbum(album));
    })
}

fetchUserAlbumList(1).then(renderAlbumList);


function fetchUserPosts(userId) {
    return fetchData(`${ BASE_URL }/users/${ userId }/posts?_expand=user`);
  }
  
  function fetchPostComments(postId) {
    return fetchData(`${ BASE_URL }/posts/${ postId }/comments`);
  }

//   fetchUserPosts(1).then(console.log); // why does this work?  Wait, what?  

//   fetchPostComments(1).then(console.log); // again, I'm freaking out here! What gives!?


  function setCommentsOnPost(post) {
    // if we already have comments, don't fetch them again
    if (post.comments) {
      // #1: Something goes here
      return Promise.reject(null);
    }

    // let fakePost = { id: 1 }

    // setCommentsOnPost(fakePost)
    //     .then(console.log)
    //     .catch(console.error) // should show the post with comments

    // setCommentsOnPost();
  
    // fetch, upgrade the post object, then return it
    return fetchPostComments(post.id)
              .then(function (comments) {
      // #2: Something goes here
                post.comments = comments;
                return post;
    });
  }


// const successfulPromise = Promise.resolve(3);

// successfulPromise.then(function (value) {
//   return 5; // oh no, we lose 3 at this step
// }).then(function (value) {
//   return value * value;
// }).then(console.log); // throwback


function renderPost(post) {
    return $(`
    <div class="post-card">
  <header>
    <h3>${post.title}</h3>
    <h3>--- ${post.user.username}</h3>
  </header>
  <p>${post.body}</p>
  <footer>
    <div class="comment-list"></div>
    <a href="#" class="toggle-comments">(<span class="verb">show</span> comments)</a>
  </footer>
</div>
    `).data('post', post);
}

function renderPostList(postList) {
    $('#app section.active').removeClass('active');
    $('#post-list').empty();
    $('#post-list').addClass('active');
    
    postList.forEach(function (post) {
        $('#post-list').append(renderPost(post))
    });
}


function toggleComments(postCardElement) {
    const footerElement = postCardElement.find('footer');
  
    if (footerElement.hasClass('comments-open')) {
      footerElement.removeClass('comments-open');
      footerElement.find('.verb').text('show');
    } else {
      footerElement.addClass('comments-open');
      footerElement.find('.verb').text('hide');
    }
  }


$('#post-list').on('click', '.post-card .toggle-comments', function () {
    const postCardElement = $(this).closest('.post-card');
    const post = postCardElement.data('post');
  
    setCommentsOnPost(post)
      .then(function (post) {
        console.log('building comments for the first time...', post);
      $('.comment-list').empty();
      post.comments.forEach(function(comment) {
          $('.comment-list').append($(`
          <h3>${comment.body} ${comment.email}</h3>
          `));
      });
        toggleComments(postCardElement);
      })
      .catch(function () {
        console.log('comments previously existed, only toggling...', post);
        toggleComments(postCardElement);
    });
  });