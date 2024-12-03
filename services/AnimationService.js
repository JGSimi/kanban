export const AnimationService = {
    fadeIn: (element, duration = 300) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
            element.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    },

    slideUp: (element, duration = 300) => {
        element.style.transform = 'translateY(50px)';
        element.style.opacity = '0';
        
        requestAnimationFrame(() => {
            element.style.transition = `all ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
            element.style.transform = 'translateY(0)';
            element.style.opacity = '1';
        });
    }
}; 