(async () => {
  // ======================== 优化部分开始 ========================
  
  // 1. 提前加载侧边栏状态
  const state = await new Promise(resolve => {
    chrome.storage.local.get(['sidebarCollapsed'], resolve);
  });
  
  const sidebarCollapsed = state.sidebarCollapsed ?? false;
  
  // 2. 添加CSS过渡抑制
  const transitionSuppressor = document.createElement('style');
  transitionSuppressor.textContent = `
    #rsi-custom-sidebar {
      transition: none !important;
      animation: none !important;
    }
  `;
  document.head.appendChild(transitionSuppressor);
  
  // 3. 创建侧边栏元素时直接应用状态
  const sidebar = document.createElement('div');
  sidebar.id = 'rsi-custom-sidebar';
  if (sidebarCollapsed) {
    sidebar.classList.add('collapsed');
  }
  
  // 4. 创建召回按钮
  const recallButton = document.createElement('button');
  recallButton.id = 'recall-button';
  recallButton.className = 'recall-button';
  recallButton.innerHTML = '<i class="fas fa-bars"></i>';
  recallButton.title = '显示导航栏';
  recallButton.style.display = sidebarCollapsed ? 'flex' : 'none';
  
  // ======================== 优化部分结束 ========================
  
  // 侧边栏头部
  const sidebarHeader = document.createElement('div');
  sidebarHeader.className = 'sidebar-header';
  sidebarHeader.innerHTML = `
    <div class="brand">
      <i class="fas fa-rocket"></i>
      <span class="brand-text">RSI导航</span>
    </div>
    <button id="sidebar-toggle" class="toggle-btn">
      <i class="fas fa-chevron-left"></i>
    </button>
  `;
  
  // 导航容器
  const navContainer = document.createElement('div');
  navContainer.id = 'sidebar-nav';
  
  sidebar.appendChild(sidebarHeader);
  sidebar.appendChild(navContainer);
  document.body.appendChild(sidebar);
  document.body.appendChild(recallButton);
  
  // 加载分类数据
  const loadCategoryData = () => {
    return new Promise(resolve => {
      chrome.storage.local.get(['rsiCategories'], result => {
        resolve(result.rsiCategories || {});
      });
    });
  };
  
  // 渲染分类导航
  const renderCategories = async () => {
    const categories = await loadCategoryData();
    navContainer.innerHTML = '';
    
    // 添加Font Awesome图标
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const fontAwesome = document.createElement('link');
      fontAwesome.rel = 'stylesheet';
      fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
      document.head.appendChild(fontAwesome);
    }
    
    const categoryOrder = ['beginner', 'personal', 'shop', 'official', 'thrurl' , 'custom'];
    
    categoryOrder.forEach(categoryId => {
      if (!categories[categoryId]) return;
      
      const category = categories[categoryId];
      const categoryElement = document.createElement('div');
      categoryElement.className = `category ${category.expanded ? 'expanded' : ''}`;
      categoryElement.dataset.id = categoryId;
      
      const categoryHeader = document.createElement('div');
      categoryHeader.className = 'category-header';
      categoryHeader.innerHTML = `
        <span><i class="fas fa-${getCategoryIcon(categoryId)}"></i> ${category.name}</span>
        <i class="fas fa-chevron-right"></i>
      `;
      
      const categoryContent = document.createElement('div');
      categoryContent.className = 'category-content';
      
      if (category.links?.length > 0) {
        category.links.forEach(link => {
          const linkElement = document.createElement('a');
          linkElement.href = link.url;
          linkElement.className = 'nav-item';
          linkElement.target = '_self';
          linkElement.innerHTML = `
            <i class="fas fa-${link.icon || 'link'}"></i>
            <span class="nav-text">${link.name}</span>
          `;
          categoryContent.appendChild(linkElement);
        });
      } else if (categoryId === 'custom') {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'no-links';
        emptyMsg.textContent = '暂无自定义链接';
        categoryContent.appendChild(emptyMsg);
      }
      
      // 始终显示添加链接按钮（仅限自定义分类）
      if (categoryId === 'custom') {
        const addButton = document.createElement('button');
        addButton.id = 'add-custom-link';
        addButton.className = 'add-custom-link';
        addButton.innerHTML = '<i class="fas fa-plus-circle"></i> 添加链接';
        addButton.addEventListener('click', () => {
          chrome.runtime.sendMessage({action: "openPopup"});
        });
        categoryContent.appendChild(addButton);
      }
      
      categoryElement.appendChild(categoryHeader);
      categoryElement.appendChild(categoryContent);
      navContainer.appendChild(categoryElement);
      
      categoryHeader.addEventListener('click', () => {
        categoryElement.classList.toggle('expanded');
        chrome.storage.local.get(['rsiCategories'], result => {
          const categories = result.rsiCategories || {};
          if (categories[categoryId]) {
            categories[categoryId].expanded = categoryElement.classList.contains('expanded');
            chrome.storage.local.set({rsiCategories: categories});
          }
        });
      });
    });
  };
  
  // 获取分类图标
  const getCategoryIcon = (categoryId) => {
    const icons = {
      beginner: 'compass',
      personal: 'user-astronaut',
      shop: 'dollar',
      official: 'newspaper',
      thrurl: 'thumbs-o-up',
      custom: 'sliders-h'
    };
    return icons[categoryId] || 'folder';
  };
  
  // 初始渲染
  await renderCategories();
  
  // 监听存储变化
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.rsiCategories) {
      renderCategories();
    }
  });
  
  // 侧边栏切换
  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    sidebar.classList.add('collapsed');
    recallButton.style.display = 'flex';
    chrome.storage.local.set({sidebarCollapsed: true});
  });
  
  // 召回按钮
  recallButton.addEventListener('click', () => {
    sidebar.classList.remove('collapsed');
    recallButton.style.display = 'none';
    chrome.storage.local.set({sidebarCollapsed: false});
  });
  
  // ======================== 优化部分补充 ========================
  
  // 5. 稍后启用过渡效果
  setTimeout(() => {
    transitionSuppressor.remove();
    sidebar.style.transition = 'transform 0.3s ease';
    
    // 添加折叠动画到召回按钮
    recallButton.style.transition = 'opacity 0.2s ease';
  }, 300);
  
  // ======================== 优化部分结束 ========================
})();
