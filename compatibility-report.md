## 兼容性問題記錄

### Safari 15
- 問題：日期選擇器樣式異常
- 解決方案：添加polyfill
  ```html
  <script src="https://cdn.jsdelivr.net/npm/date-fns@2.29.3"></script>
  ```

### Firefox Mobile
- 問題：表單提交後頁面跳轉失效
- 解決方案：改用AJAX提交
  ```javascript
  form.addEventListener('submit', async (e) => {
      e.preventDefault();
      // ...提交邏輯
  });
  ```

### Chrome 120+
- 問題：自動填充遮擋標籤
- 解決方案：調整標籤位置
  ```css
  .form-group label {
      transform: translateY(-120%);
      background: white;
      padding: 0 0.5rem;
  }
  ``` 