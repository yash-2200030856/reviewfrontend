async function loadProducts() {
  try {
    const res = await fetch("http://localhost:5000/products");

    if (!res.ok) throw new Error("Failed to fetch products");

    const products = await res.json();
    const select = document.getElementById("productId");
    select.innerHTML = "";

    if (!products.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No products available";
      select.appendChild(option);
      return;
    }

    products.forEach(product => {
      const option = document.createElement("option");
      option.value = product.id;
      option.textContent = product.name || `Product ${product.id}`;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Failed to load products:", error);
    const select = document.getElementById("productId");
    select.innerHTML = "<option value=''>Error loading</option>";
  }
}

function handlePageLoad() {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    document.getElementById("auth-section").style.display = "block";
    document.getElementById("review-section").style.display = "none";
  } else {
    const userInput = document.getElementById("userId");
    if (userInput) userInput.value = userId;
    document.getElementById("auth-section").style.display = "none";
    document.getElementById("review-section").style.display = "block";
    loadProducts();
  }
}

function showPopup(message) {
  let popup = document.createElement('div');
  popup.className = 'custom-popup';
  popup.innerHTML = `<span>${message}</span>`;
  document.body.appendChild(popup);
  setTimeout(() => {
    popup.classList.add('show');
  }, 10);
  setTimeout(() => {
    popup.classList.remove('show');
    setTimeout(() => popup.remove(), 300);
  }, 1800);
}

async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const err = await res.text();
      alert("Login failed: " + err);
      return;
    }

    const data = await res.json();

    if (data.user && data.user.id) {
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("token", data.token);
      showPopup("Login successful");
      setTimeout(() => { location.href = "index.html"; }, 1800);
    } else {
      alert("Login failed: Invalid response structure");
    }

  } catch (err) {
    console.error("Login error:", err);
    alert("Error logging in");
  }
}

async function submitReview() {
  const userId = localStorage.getItem('userId');
  const productId = document.getElementById('productId').value;
  const rating = document.getElementById('rating').value;
  const reviewText = document.getElementById('reviewText').value;

  if (!userId) {
    alert("Please login first");
    return;
  }

  try {
    const reviewCheckRes = await fetch("http://localhost:5000/check-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: parseInt(userId),
        product_id: parseInt(productId)
      })
    });

    if (!reviewCheckRes.ok) {
      const err = await reviewCheckRes.text();
      throw new Error("Review check failed: " + err);
    }

    const data = await reviewCheckRes.json();
    if (data.exists) {
      alert("You have already submitted a review for this product.");
      return;
    }

    if (rating) {
      const ratingRes = await fetch('http://localhost:5000/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId),
          product_id: parseInt(productId),
          rating: parseInt(rating)
        })
      });

      if (!ratingRes.ok) {
        const err = await ratingRes.text();
        throw new Error("Rating failed: " + err);
      }

      const ratingMsg = await ratingRes.text();
      alert(ratingMsg);
    }

    if (reviewText) {
      const reviewRes = await fetch('http://localhost:5000/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: parseInt(userId),
          product_id: parseInt(productId),
          review: reviewText
        })
      });

      if (!reviewRes.ok) {
        const err = await reviewRes.text();
        throw new Error("Review failed: " + err);
      }

      const reviewMsg = await reviewRes.text();
      alert(reviewMsg);
    }
  } catch (err) {
    console.error("Submission error:", err);
    alert("Error: " + err.message);
  }
}

function logout() {
  localStorage.removeItem("userId");
  localStorage.removeItem("token");
  location.href = "login.html";
}
