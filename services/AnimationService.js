export default class AnimationService {
    static transitions = {
        default: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        smooth: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
    };

    static keyframes = {
        fadeIn: [
            { opacity: 0, transform: 'translateY(20px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ],
        fadeOut: [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(20px)' }
        ],
        slideDown: [
            { transform: 'translateY(-20px)', opacity: 0 },
            { transform: 'translateY(0)', opacity: 1 }
        ],
        slideUp: [
            { transform: 'translateY(20px)', opacity: 0 },
            { transform: 'translateY(0)', opacity: 1 }
        ],
        scaleIn: [
            { transform: 'scale(0.95)', opacity: 0 },
            { transform: 'scale(1)', opacity: 1 }
        ],
        shake: [
            { transform: 'translateX(0)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(0)' }
        ]
    };

    static animate(element, keyframeName, options = {}) {
        const defaultOptions = {
            duration: 300,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            fill: 'forwards'
        };

        const animationOptions = { ...defaultOptions, ...options };
        const keyframes = this.keyframes[keyframeName];

        if (!keyframes) {
            console.error(`Keyframe animation "${keyframeName}" not found`);
            return null;
        }

        return element.animate(keyframes, animationOptions);
    }

    static transition(element, properties = 'all') {
        element.style.transition = this.transitions.default;
        element.style.transitionProperty = properties;
    }

    static transitionWithBounce(element, properties = 'all') {
        element.style.transition = this.transitions.bounce;
        element.style.transitionProperty = properties;
    }

    static transitionWithSpring(element, properties = 'all') {
        element.style.transition = this.transitions.spring;
        element.style.transitionProperty = properties;
    }

    static addHoverEffect(element, scale = 1.02) {
        element.addEventListener('mouseenter', () => {
            element.style.transform = `scale(${scale})`;
            element.style.transition = this.transitions.bounce;
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = 'scale(1)';
            element.style.transition = this.transitions.bounce;
        });
    }

    static addClickEffect(element) {
        element.addEventListener('mousedown', () => {
            element.style.transform = 'scale(0.95)';
            element.style.transition = this.transitions.smooth;
        });

        element.addEventListener('mouseup', () => {
            element.style.transform = 'scale(1)';
            element.style.transition = this.transitions.bounce;
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = 'scale(1)';
            element.style.transition = this.transitions.bounce;
        });
    }

    static shake(element) {
        return this.animate(element, 'shake', {
            duration: 500,
            easing: 'cubic-bezier(0.36, 0, 0.66, -0.56)'
        });
    }

    static fadeIn(element, duration = 300) {
        return this.animate(element, 'fadeIn', { duration });
    }

    static fadeOut(element, duration = 300) {
        return this.animate(element, 'fadeOut', { duration });
    }

    static slideDown(element, duration = 300) {
        return this.animate(element, 'slideDown', { duration });
    }

    static slideUp(element, duration = 300) {
        return this.animate(element, 'slideUp', { duration });
    }

    static scaleIn(element, duration = 300) {
        return this.animate(element, 'scaleIn', { duration });
    }
} 