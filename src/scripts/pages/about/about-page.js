export default class AboutPage {
  async render() {
    return `
      <section class="container">
        <div class="card fade-in-up">
          <h1 style="text-align: center; margin-bottom: 30px;">About Story App</h1>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; margin-bottom: 30px;">
            <div>
              <h2 style="color: var(--secondary-color); margin-bottom: 15px;">Our Mission</h2>
              <p style="color: #666; line-height: 1.8; margin-bottom: 20px;">
                Story App is dedicated to connecting people through the power of storytelling. We believe that every moment, no matter how small, has the potential to inspire, educate, and bring joy to others.
              </p>
              <p style="color: #666; line-height: 1.8;">
                Our platform provides a safe and creative space where users can share their experiences, adventures, thoughts, and memories with a global community of storytellers.
              </p>
            </div>
            <div style="text-align: center;">
              <div style="width: 200px; height: 200px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">📚</div>
            </div>
          </div>
        </div>
        
        <div class="card fade-in-up">
          <h2 style="color: var(--secondary-color); margin-bottom: 20px;">Features</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
            <div style="padding: 20px; background: var(--very-light-gray); border-radius: 12px; text-align: center;">
              <div style="font-size: 2rem; margin-bottom: 10px;">📝</div>
              <h3 style="color: var(--primary-color); margin-bottom: 10px;">Easy Sharing</h3>
              <p style="color: #666;">Share your stories with just a few clicks</p>
            </div>
            <div style="padding: 20px; background: var(--very-light-gray); border-radius: 12px; text-align: center;">
              <div style="font-size: 2rem; margin-bottom: 10px;">🌍</div>
              <h3 style="color: var(--primary-color); margin-bottom: 10px;">Global Community</h3>
              <p style="color: #666;">Connect with storytellers worldwide</p>
            </div>
            <div style="padding: 20px; background: var(--very-light-gray); border-radius: 12px; text-align: center;">
              <div style="font-size: 2rem; margin-bottom: 10px;">❤️</div>
              <h3 style="color: var(--primary-color); margin-bottom: 10px;">Safe Space</h3>
              <p style="color: #666;">A supportive environment for all</p>
            </div>
          </div>
        </div>
        
        <div class="card fade-in-up">
          <h2 style="color: var(--secondary-color); margin-bottom: 15px;">Made with ❤️ by Toca</h2>
          <p style="color: #666; line-height: 1.6;">
            Story App is crafted with passion and dedication to provide the best storytelling experience. 
            We're constantly working to improve and add new features based on our community's feedback.
          </p>
          <p style="color: #888; margin-top: 20px; text-align: center; font-size: 0.9rem;">
            © 2025 Story App. All rights reserved.
          </p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    // Add fade-in animation to elements
    const elements = document.querySelectorAll('.fade-in-up');
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease-out';
        
        requestAnimationFrame(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        });
      }, index * 200);
    });
  }
}
