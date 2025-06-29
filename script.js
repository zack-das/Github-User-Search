document.addEventListener('DOMContentLoaded', () => {
  const githubForm = document.getElementById('github-form');
  const searchInput = document.getElementById('search');
  const userList = document.getElementById('user-list');
  const reposList = document.getElementById('repos-list');

  githubForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
      try {
        // Show loading state
        userList.innerHTML = '<div class="loading" style="margin: 50px auto;"></div>';
        
        const users = await searchUsers(searchTerm);
        displayUsers(users);
      } catch (error) {
        console.error('Error searching users:', error);
        userList.innerHTML = `
          <div style="color: var(--neon-pink); text-align: center; margin: 50px 0;">
            <h3>SYSTEM ERROR</h3>
            <p>${error.message || 'Failed to fetch users'}</p>
            <p>PLEASE TRY AGAIN</p>
          </div>
        `;
      }
    }
  });

  async function searchUsers(query) {
    const response = await fetch(`https://api.github.com/search/users?q=${query}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API RESPONSE: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items;
  }

  function displayUsers(users) {
    userList.innerHTML = '';
    reposList.innerHTML = '';
    
    if (users.length === 0) {
      userList.innerHTML = `
        <div style="color: var(--neon-blue); text-align: center; margin: 50px 0;">
          <h3>NO USERS FOUND</h3>
          <p>SEARCH PARAMETERS DID NOT MATCH ANY PROFILES</p>
        </div>
      `;
      return;
    }
    
    users.forEach(user => {
      const userCard = document.createElement('div');
      userCard.className = 'user-card';
      userCard.innerHTML = `
        <img src="${user.avatar_url}" alt="${user.login}" onerror="this.src='https://via.placeholder.com/150/0d0221/ffffff?text=USER'">
        <h3>${user.login}</h3>
        <a href="${user.html_url}" target="_blank">ACCESS_PROFILE</a>
      `;
      
      userCard.addEventListener('click', async () => {
        try {
          userList.querySelectorAll('.user-card').forEach(card => {
            card.style.opacity = '0.5';
          });
          userCard.style.opacity = '1';
          userCard.style.border = `2px solid ${user.login.length % 2 === 0 ? 'var(--neon-blue)' : 'var(--neon-pink)'}`;
          
          reposList.innerHTML = `
            <h2>LOADING_REPOSITORIES<span style="color: var(--neon-pink)">_</span></h2>
            <div class="loading" style="margin: 20px auto;"></div>
          `;
          
          const repos = await getUserRepos(user.login);
          displayRepos(user.login, repos);
        } catch (error) {
          console.error('Error fetching repos:', error);
          reposList.innerHTML = `
            <div style="color: var(--neon-pink);">
              <h3>DATA_TRANSFER_FAILURE</h3>
              <p>UNABLE TO RETRIEVE REPOSITORIES FOR ${user.login.toUpperCase()}</p>
              <p>ERROR_CODE: ${error.message || 'UNKNOWN'}</p>
            </div>
          `;
        }
      });
      
      userList.appendChild(userCard);
    });
  }

  async function getUserRepos(username) {
    const response = await fetch(`https://api.github.com/users/${username}/repos`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API RESPONSE: ${response.status}`);
    }
    
    return await response.json();
  }

  function displayRepos(username, repos) {
    reposList.innerHTML = `
      <h2>REPOSITORIES_FOR_<span style="color: var(--neon-pink)">${username.toUpperCase()}</span></h2>
      <p style="color: var(--neon-blue); margin-bottom: 20px;">TOTAL: ${repos.length}</p>
    `;
    
    if (repos.length === 0) {
      reposList.innerHTML += `
        <div class="repo-item" style="text-align: center;">
          <h3>NO PUBLIC REPOSITORIES FOUND</h3>
          <p>THIS USER HAS NOT PUBLISHED ANY CODE</p>
        </div>
      `;
      return;
    }
    
    repos.forEach(repo => {
      const repoItem = document.createElement('div');
      repoItem.className = 'repo-item';
      repoItem.innerHTML = `
        <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
        <p>${repo.description || 'NO DESCRIPTION AVAILABLE'}</p>
        <div class="repo-stats">
          <span>⭐ ${repo.stargazers_count}</span>
          <span>🍴 ${repo.forks_count}</span>
          <span>👁️ ${repo.watchers_count}</span>
        </div>
      `;
      reposList.appendChild(repoItem);
    });
  }
});