document.addEventListener('DOMContentLoaded', function() {
  // DOM元素
  const manageTab = document.getElementById('manage-tab');
  const addTab = document.getElementById('add-tab');
  const addLinkForm = document.getElementById('add-link-form');
  const manageLinks = document.getElementById('manage-links');
  const linksContainer = document.getElementById('links-container');
  const addLinkBtn = document.getElementById('add-link-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const addNewLinkBtn = document.getElementById('add-new-link');
  const addErrorContainer = document.getElementById('add-error');
  
  // 标签页切换功能
  manageTab.addEventListener('click', () => {
    manageTab.classList.add('active');
    addTab.classList.remove('active');
    addLinkForm.classList.remove('active');
    manageLinks.classList.add('active');
    loadLinks();
    hideError();
  });
  
  addTab.addEventListener('click', () => {
    addTab.classList.add('active');
    manageTab.classList.remove('active');
    manageLinks.classList.remove('active');
    addLinkForm.classList.add('active');
    hideError();
  });
  
  // 添加新链接按钮
  addNewLinkBtn.addEventListener('click', () => {
    console.log('切换到添加标签页');
    addTab.click();
  });
  
  // 取消按钮
  cancelBtn.addEventListener('click', () => {
    console.log('切换到管理标签页');
    manageTab.click();
  });
  
  // 添加链接功能
  addLinkBtn.addEventListener('click', () => {
    console.log('添加链接按钮点击');
    addNewLink();
  });
  
  // 初始化时加载链接
  loadLinks();
  
  // 显示错误信息
  function showError(message) {
    console.log('显示错误:', message);
    addErrorContainer.textContent = message;
    addErrorContainer.style.display = 'block';
  }
  
  // 隐藏错误信息
  function hideError() {
    addErrorContainer.style.display = 'none';
  }
  
  // 添加新链接函数
  function addNewLink() {
    hideError();
    
    const linkName = document.getElementById('link-name').value.trim();
    const linkUrl = document.getElementById('link-url').value.trim();
    
    console.log('添加链接名称:', linkName);
    console.log('添加链接URL:', linkUrl);
    
    // 验证输入
    if (!linkName) {
      showError('请输入链接名称');
      return;
    }
    
    if (!linkUrl) {
      showError('请输入URL地址');
      return;
    }
    
    // 验证URL格式
    if (!isValidUrl(linkUrl)) {
      showError('请输入有效的URL地址（需包含http://或https://）');
      return;
    }
    
    // 获取当前存储的分类数据
    chrome.storage.local.get(['rsiCategories'], (result) => {
      const categories = result.rsiCategories || {};
      
      // 创建新链接对象
      const newLink = {
        name: linkName,
        url: linkUrl,
        icon: "link"
      };
      
      // 确保自定义分类存在
      if (!categories.custom) {
        categories.custom = {
          name: "自定义",
          expanded: true,
          links: []
        };
      }
      
      // 添加新链接到自定义分类
      categories.custom.links.push(newLink);
      
      // 保存更新后的分类数据
      chrome.storage.local.set({ rsiCategories: categories }, () => {
        console.log('新链接已保存');
        
        // 切换到管理标签页
        manageTab.click();
        
        // 刷新链接列表
        loadLinks();
        
        // 清除表单
        document.getElementById('link-name').value = '';
        document.getElementById('link-url').value = '';
        
        // 通知内容脚本刷新
        refreshSidebar();
      });
    });
  }
  
  // 加载链接列表
  function loadLinks() {
    console.log('加载链接列表');
    linksContainer.innerHTML = '<p class="loading">加载中...</p>';
    
    chrome.storage.local.get(['rsiCategories'], (result) => {
      const categories = result.rsiCategories || {};
      linksContainer.innerHTML = '';
      
      let hasLinks = false;
      
      // 只显示自定义分类的链接
      if (categories.custom?.links?.length > 0) {
        hasLinks = true;
        
        categories.custom.links.forEach((link, index) => {
          const linkItem = document.createElement('div');
          linkItem.className = 'link-item';
          linkItem.innerHTML = `
            <div class="link-info">
              <div class="link-icon">
                <i class="fas fa-${link.icon || 'link'}"></i>
              </div>
              <div class="link-details">
                <div class="link-name">${link.name}</div>
                <div class="link-url">${link.url}</div>
              </div>
            </div>
            <div class="link-actions">
              <button class="action-btn delete-btn" data-category="custom" data-index="${index}">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          `;
          linksContainer.appendChild(linkItem);
        });
      }
      
      // 如果没有链接
      if (!hasLinks) {
        linksContainer.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-folder-open"></i>
            <h3>暂无自定义链接</h3>
            <p>点击下方按钮添加您的第一个链接</p>
          </div>
        `;
      }
      
      // 添加删除事件
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const categoryId = this.dataset.category;
          const index = parseInt(this.dataset.index);
          console.log('删除链接:', categoryId, index);
          deleteLink(categoryId, index);
        });
      });
    });
  }
  
  // 删除链接
  function deleteLink(categoryId, index) {
    console.log('正在删除链接...');
    chrome.storage.local.get(['rsiCategories'], (result) => {
      const categories = result.rsiCategories || {};
      
      if (categories[categoryId]?.links) {
        // 删除指定索引的链接
        categories[categoryId].links.splice(index, 1);
        
        // 保存更新后的分类数据
        chrome.storage.local.set({ rsiCategories: categories }, () => {
          console.log('链接已删除');
          // 刷新链接列表
          loadLinks();
          
          // 通知内容脚本刷新
          refreshSidebar();
        });
      }
    });
  }
  
  // 刷新侧边栏
  function refreshSidebar() {
    console.log('刷新侧边栏');
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "refreshSidebar"});
      }
    });
  }
  
  // 辅助函数：验证URL格式
  function isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }
});
