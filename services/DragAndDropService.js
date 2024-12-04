import AnimationService from './AnimationService.js';

export default class DragAndDropService {
    constructor(options = {}) {
        this.options = {
            draggableSelector: options.draggableSelector || '[data-draggable]',
            dropzoneSelector: options.dropzoneSelector || '[data-dropzone]',
            handleSelector: options.handleSelector || '[data-drag-handle]',
            dragClass: options.dragClass || 'is-dragging',
            dragOverClass: options.dragOverClass || 'is-drag-over',
            ghostClass: options.ghostClass || 'drag-ghost',
            onDragStart: options.onDragStart || (() => {}),
            onDragEnd: options.onDragEnd || (() => {}),
            onDrop: options.onDrop || (() => {}),
            animation: options.animation !== false
        };

        this.draggedElement = null;
        this.ghostElement = null;
        this.originalPosition = null;
        this.dropzones = [];
        this.initialX = 0;
        this.initialY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.xOffset = 0;
        this.yOffset = 0;
        this.active = false;

        this.init();
    }

    init() {
        document.addEventListener('mousedown', this.handleDragStart.bind(this));
        document.addEventListener('mousemove', this.handleDragMove.bind(this));
        document.addEventListener('mouseup', this.handleDragEnd.bind(this));
        document.addEventListener('touchstart', this.handleDragStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleDragMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleDragEnd.bind(this));

        // Inicializa as dropzones
        this.updateDropzones();
    }

    updateDropzones() {
        this.dropzones = Array.from(document.querySelectorAll(this.options.dropzoneSelector));
    }

    createGhost(element) {
        const ghost = element.cloneNode(true);
        ghost.classList.add(this.options.ghostClass);
        ghost.style.position = 'fixed';
        ghost.style.pointerEvents = 'none';
        ghost.style.zIndex = '9999';
        ghost.style.width = `${element.offsetWidth}px`;
        ghost.style.height = `${element.offsetHeight}px`;
        ghost.style.opacity = '0.8';
        ghost.style.transform = 'scale(1.05)';
        document.body.appendChild(ghost);
        return ghost;
    }

    getEventPosition(e) {
        if (e.type.includes('mouse')) {
            return {
                x: e.clientX,
                y: e.clientY
            };
        }
        return {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        };
    }

    handleDragStart(e) {
        const target = e.target.closest(this.options.draggableSelector);
        const handle = e.target.closest(this.options.handleSelector);

        if (!target || (this.options.handleSelector && !handle)) return;

        e.preventDefault();
        
        const pos = this.getEventPosition(e);
        this.initialX = pos.x - this.xOffset;
        this.initialY = pos.y - this.yOffset;

        if (target.contains(e.target)) {
            this.active = true;
            this.draggedElement = target;
            
            // Salva a posição original
            const rect = target.getBoundingClientRect();
            this.originalPosition = {
                x: rect.left,
                y: rect.top,
                parent: target.parentElement
            };

            // Cria e posiciona o ghost
            this.ghostElement = this.createGhost(target);
            this.ghostElement.style.left = `${rect.left}px`;
            this.ghostElement.style.top = `${rect.top}px`;

            // Adiciona classe de arrastar
            this.draggedElement.classList.add(this.options.dragClass);

            if (this.options.animation) {
                AnimationService.scaleIn(this.ghostElement);
            }

            this.options.onDragStart(this.draggedElement);
        }
    }

    handleDragMove(e) {
        if (!this.active || !this.draggedElement || !this.ghostElement) return;

        e.preventDefault();

        const pos = this.getEventPosition(e);
        this.currentX = pos.x - this.initialX;
        this.currentY = pos.y - this.initialY;

        this.xOffset = this.currentX;
        this.yOffset = this.currentY;

        this.ghostElement.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0) scale(1.05)`;

        // Verifica colisão com dropzones
        const ghostRect = this.ghostElement.getBoundingClientRect();
        const center = {
            x: ghostRect.left + ghostRect.width / 2,
            y: ghostRect.top + ghostRect.height / 2
        };

        let foundDropzone = false;
        this.dropzones.forEach(dropzone => {
            const dropRect = dropzone.getBoundingClientRect();
            
            if (center.x >= dropRect.left && 
                center.x <= dropRect.right && 
                center.y >= dropRect.top && 
                center.y <= dropRect.bottom) {
                dropzone.classList.add(this.options.dragOverClass);
                foundDropzone = true;
            } else {
                dropzone.classList.remove(this.options.dragOverClass);
            }
        });

        document.body.style.cursor = foundDropzone ? 'copy' : 'no-drop';
    }

    handleDragEnd(e) {
        if (!this.active || !this.draggedElement || !this.ghostElement) return;

        e.preventDefault();

        const finalPosition = this.getEventPosition(e);
        let droppedOnDropzone = false;

        // Verifica se soltou em uma dropzone
        this.dropzones.forEach(dropzone => {
            const rect = dropzone.getBoundingClientRect();
            
            if (finalPosition.x >= rect.left && 
                finalPosition.x <= rect.right && 
                finalPosition.y >= rect.top && 
                finalPosition.y <= rect.bottom) {
                
                if (this.options.animation) {
                    AnimationService.fadeOut(this.ghostElement).onfinish = () => {
                        this.ghostElement.remove();
                    };
                } else {
                    this.ghostElement.remove();
                }

                this.options.onDrop(this.draggedElement, dropzone);
                droppedOnDropzone = true;
            }
            
            dropzone.classList.remove(this.options.dragOverClass);
        });

        // Se não soltou em uma dropzone, volta para a posição original
        if (!droppedOnDropzone) {
            if (this.options.animation) {
                const animation = this.ghostElement.animate([
                    { transform: `translate3d(${this.currentX}px, ${this.currentY}px, 0) scale(1.05)` },
                    { transform: 'translate3d(0, 0, 0) scale(1)' }
                ], {
                    duration: 300,
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
                });

                animation.onfinish = () => {
                    this.ghostElement.remove();
                };
            } else {
                this.ghostElement.remove();
            }
        }

        this.draggedElement.classList.remove(this.options.dragClass);
        document.body.style.cursor = '';
        
        this.options.onDragEnd(this.draggedElement);

        // Reset das variáveis
        this.active = false;
        this.draggedElement = null;
        this.ghostElement = null;
        this.xOffset = 0;
        this.yOffset = 0;
    }
} 