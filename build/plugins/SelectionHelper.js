class SelectionHelper {
    constructor(selectionBox, renderer, cssClass) {
        this.element = document.createElement("div");
        this.element.classList.add(cssClass);
        this.element.style.pointerEvents = "none";
        this.renderer = renderer;

        this.startPoint = { x: 0, y: 0 };
        this.pointTopLeft = { x: 0, y: 0 };
        this.pointBottomRight = { x: 0, y: 0 };

        this.isDown = false;

        this.renderer.domElement.addEventListener("mousedown", (event) => {
            this.isDown = true;
            this.onSelectStart(event);
        }, false);

        this.renderer.domElement.addEventListener("mousemove", (event) => {
            if (this.isDown) {
                this.onSelectMove(event);
            }
        }, false);

        this.renderer.domElement.addEventListener("mouseup", (event) => {
            this.isDown = false;
            this.onSelectOver(event);
        }, false);
    }

    onSelectStart(event) {
        this.renderer.domElement.parentElement.appendChild(this.element);
        this.element.style.left = event.clientX + "px";
        this.element.style.top = event.clientY + "px";
        this.element.style.width = "0px";
        this.element.style.height = "0px";
        this.startPoint.x = event.clientX;
        this.startPoint.y = event.clientY;
    }

    onSelectMove(event) {
        this.pointBottomRight.x = Math.max(this.startPoint.x, event.clientX);
        this.pointBottomRight.y = Math.max(this.startPoint.y, event.clientY);
        this.pointTopLeft.x = Math.min(this.startPoint.x, event.clientX);
        this.pointTopLeft.y = Math.min(this.startPoint.y, event.clientY);

        this.element.style.left = this.pointTopLeft.x + "px";
        this.element.style.top = this.pointTopLeft.y + "px";
        this.element.style.width = (this.pointBottomRight.x - this.pointTopLeft.x) + "px";
        this.element.style.height = (this.pointBottomRight.y - this.pointTopLeft.y) + "px";
    }

    onSelectOver() {
        this.element.parentElement.removeChild(this.element);
    }
}