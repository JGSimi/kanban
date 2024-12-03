export default class Loading {
    constructor(options = {}) {
        this.options = {
            type: options.type || 'spinner', // spinner, skeleton, pulse
            text: options.text || 'Carregando...',
            size: options.size || 'md', // sm, md, lg
            color: options.color || 'blue',
            fullscreen: options.fullscreen || false,
            customClass: options.customClass || ''
        };
    }

    create() {
        const container = document.createElement('div');
        
        if (this.options.fullscreen) {
            container.className = `fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50 ${this.options.customClass}`;
        } else {
            container.className = `flex flex-col items-center justify-center p-8 ${this.options.customClass}`;
        }

        const sizes = {
            sm: { spinner: 'w-6 h-6', text: 'text-sm' },
            md: { spinner: 'w-10 h-10', text: 'text-base' },
            lg: { spinner: 'w-16 h-16', text: 'text-lg' }
        };

        switch (this.options.type) {
            case 'spinner':
                container.innerHTML = `
                    <div class="flex flex-col items-center gap-4">
                        <div class="${sizes[this.options.size].spinner} animate-spin">
                            <svg class="text-${this.options.color}-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        <span class="text-gray-600 ${sizes[this.options.size].text} animate-pulse">
                            ${this.options.text}
                        </span>
                    </div>
                `;
                break;

            case 'skeleton':
                container.innerHTML = `
                    <div class="space-y-4 w-full">
                        <div class="h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div class="space-y-2">
                            <div class="h-4 bg-gray-200 rounded-lg animate-pulse"></div>
                            <div class="h-4 bg-gray-200 rounded-lg animate-pulse w-5/6"></div>
                            <div class="h-4 bg-gray-200 rounded-lg animate-pulse w-4/6"></div>
                        </div>
                    </div>
                `;
                break;

            case 'pulse':
                container.innerHTML = `
                    <div class="flex flex-col items-center gap-4">
                        <div class="${sizes[this.options.size].spinner} rounded-full bg-gradient-to-r from-${this.options.color}-500 to-${this.options.color}-600 animate-pulse"></div>
                        <span class="text-gray-600 ${sizes[this.options.size].text} animate-pulse">
                            ${this.options.text}
                        </span>
                    </div>
                `;
                break;
        }

        return container;
    }

    static show(options = {}) {
        const loading = new Loading({ ...options, fullscreen: true });
        const element = loading.create();
        document.body.appendChild(element);
        return element;
    }

    static hide(element) {
        if (element && element.parentNode) {
            element.classList.add('fade-out');
            setTimeout(() => element.remove(), 300);
        }
    }
} 