function login() {
  const username = document.getElementById('username').value.trim();
  if (username === "") {
    showNotification("Please enter your name!", "error");
    return;
  }
  localStorage.setItem("username", username);
  document.getElementById("login-section").classList.add("hidden");
  document.getElementById("greet-section").classList.remove("hidden");
  document.getElementById("greet").innerText = `Welcome, ${username}!`;
  showNotification("Successfully logged in!", "success");
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
    ${message}
  `;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

document.addEventListener('submit', function(event) {
  if (event.target.id === 'blogForm') {
    saveBlog(event);
  }
});

window.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("username");
  if (user && document.getElementById("greet")) {
    document.getElementById("greet").innerText = `Welcome, ${user}!`;
    document.getElementById("login-section").classList.add("hidden");
    document.getElementById("greet-section").classList.remove("hidden");
  }

  if (window.location.pathname.includes("read.html")) {
    if (localStorage.getItem("blogPostSuccess") === "true") {
      showNotification("Blog posted successfully!", "success");
      localStorage.removeItem("blogPostSuccess");
    }

    const blogList = document.getElementById("blog-list");
    if (!blogList) {
      console.error("Blog list container not found");
      return;
    }

    try {
      const blogs = JSON.parse(localStorage.getItem("blogs") || "[]");
      console.log("Loaded blogs:", blogs);

      if (blogs.length === 0) {
        blogList.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-pen-fancy"></i>
            <h3>No stories yet</h3>
            <p>Be the first one to share your thoughts!</p>
            <a href="write.html" class="action-btn">
              <i class="fas fa-pen"></i>
              Write a Story
            </a>
          </div>
        `;
      } else {
        blogList.innerHTML = '';
        [...blogs].reverse().forEach(blog => {
          const div = document.createElement("div");
          div.className = "blog-card";

          const title = blog.title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
          const content = blog.content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
          const author = (blog.author || 'Anonymous').replace(/</g, "&lt;").replace(/>/g, "&gt;");

          div.innerHTML = `
            <h3 class="blog-title">${title}</h3>
            <p class="blog-content">${content}</p>
            <div class="blog-meta">
              <span><i class="fas fa-user"></i> ${author}</span>
              <span><i class="fas fa-calendar"></i> ${formatDate(blog.date)}</span>
            </div>
          `;
          blogList.appendChild(div);
        });
      }
    } catch (error) {
      console.error("Error loading blogs:", error);
      blogList.innerHTML = `
        <div class="empty-state error">
          <i class="fas fa-exclamation-circle"></i>
          <h3>Error Loading Stories</h3>
          <p>There was a problem loading the stories. Please try again later.</p>
        </div>
      `;
    }
  }
});

function saveBlog(event) {
  if (event) {
    event.preventDefault();
  }

  const titleElement = document.getElementById("blog-title") || document.getElementById("blogTitle");
  const contentElement = document.getElementById("blog-content") || document.getElementById("blogContent");

  if (!titleElement || !contentElement) {
    showNotification("Error: Form elements not found!", "error");
    return;
  }

  const title = titleElement.value.trim();
  const content = contentElement.value.trim();
  const author = localStorage.getItem("username") || "Anonymous";  if (!author || author === "Anonymous") {
    showNotification("Please login first!", "error");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
    return;
  }

  if (title === "" || content === "") {
    showNotification("Please fill in both title and content!", "error");
    return;
  }

  try {
    console.log("Attempting to save blog:", { title, content, author });
    const blogs = JSON.parse(localStorage.getItem("blogs") || "[]");
    console.log("Current blogs:", blogs);

    const newBlog = {
      id: Date.now(),
      title,
      content,
      author,
      date: new Date().toISOString()
    };

    console.log("New blog to add:", newBlog);

    blogs.push(newBlog);
    localStorage.setItem("blogs", JSON.stringify(blogs));

    showNotification("Blog posted successfully!", "success");

    localStorage.setItem("blogPostSuccess", "true");

    window.location.href = "read.html";
  } catch (error) {
    console.error("Error saving blog:", error);
    showNotification("Error saving blog. Please try again.", "error");
  }
}
