class FileDragManager {
  overlay;
  dragCounter;
  updateFilename;

  constructor(cb = null) {
    this.dragCounter = 0;
    this.setCallback(cb);

    // Prevent default behavior for drag events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
      document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    this.dragenterListener = this.dragenterListener.bind(this);
    this.dragleaveListener = this.dragleaveListener.bind(this);
    this.dropListener = this.dropListener.bind(this);

    document.body.addEventListener('dragenter', this.dragenterListener);
    document.body.addEventListener('dragleave', this.dragleaveListener);
    // Add drop event listener
    document.body.addEventListener('drop', this.dropListener);
  }

  setActions({updateFilename}) {
    this.updateFilename = updateFilename;
  }

  setCallback(cb) {
    if (cb) {
      this.callback = cb;
    } else {
      this.callback = () => {
        const fileInput = document.querySelector('.custom-file-chooser input[type="file"]');
        if (!fileInput.files || fileInput.files.length === 0) return;

        const files = Array.from(fileInput.files);
        files.forEach(file => {
          this.addPdfFile(file);
        });
      };
    }
  }

  dragenterListener() {
    this.dragCounter++;
    if (!this.overlay) {
      // Create and show the overlay
      this.overlay = document.createElement('div');
      this.overlay.style.position = 'fixed';
      this.overlay.style.top = 0;
      this.overlay.style.left = 0;
      this.overlay.style.width = '100%';
      this.overlay.style.height = '100%';
      this.overlay.style.background = 'rgba(0, 0, 0, 0.5)';
      this.overlay.style.color = '#fff';
      this.overlay.style.zIndex = '1000';
      this.overlay.style.display = 'flex';
      this.overlay.style.alignItems = 'center';
      this.overlay.style.justifyContent = 'center';
      this.overlay.style.pointerEvents = 'none';
      this.overlay.innerHTML = '<p>Drop files anywhere to upload</p>';
      document.getElementById('content-wrap').appendChild(this.overlay);
    }
  }

  dragleaveListener() {
    this.dragCounter--;
    if (this.dragCounter === 0) {
      // Hide and remove the overlay
      if (this.overlay) {
        this.overlay.remove();
        this.overlay = null;
      }
    }
  }

  dropListener(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    // Update the file input display
    const fileInput = document.querySelector('.custom-file-chooser input[type="file"]');
    if (fileInput) {
      const dataTransfer = new DataTransfer();
      Array.from(files).forEach(file => dataTransfer.items.add(file));
      fileInput.files = dataTransfer.files;

      // Trigger change event to update the UI
      const event = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(event);
    }

    this.callback(files)
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (this.overlay) {
          this.overlay.remove();
          this.overlay = null;
        }
        this.updateFilename(files ? files[0].name : '');
      });
  }

  async addImageFile(file, nextSiblingElement) {
    const div = document.createElement('div');
    div.classList.add('page-container');

    var img = document.createElement('img');
    img.classList.add('page-image');
    img.src = URL.createObjectURL(file);
    div.appendChild(img);

    this.pdfAdapters.forEach((adapter) => {
      adapter.adapt?.(div);
    });
    if (nextSiblingElement) {
      this.pagesContainer.insertBefore(div, nextSiblingElement);
    } else {
      this.pagesContainer.appendChild(div);
    }
  }

  async addPdfFile(file, nextSiblingElement) {
    if (!file.type.includes('pdf')) return;

    const div = document.createElement('div');
    div.classList.add('page-container');

    // Add PDF preview logic here

    if (nextSiblingElement) {
      this.pagesContainer.insertBefore(div, nextSiblingElement);
    } else {
      this.pagesContainer.appendChild(div);
    }
  }
}

export default FileDragManager;
