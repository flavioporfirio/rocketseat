// Chave para identificar os dados salvos pela nossa aplicação no navegador
const STORAGE_KEY = 'prompts-storage';

//Estado para carregar os prompts salvos e exibir
const state = {
  prompts: [],
  selectedId: null,

}

const elements = {
  promptTitle: document.getElementById('prompt-title'),
  promptContent: document.getElementById('prompt-content'),
  titleWrapper: document.getElementById('title-wrapper'),
  contentWrapper: document.getElementById('content-wrapper'),
  btnOpen: document.getElementById('btn-open'),
  btnCollapse: document.getElementById('btn-collapse'),
  sidebar: document.querySelector('.sidebar'),
  btnSave: document.getElementById('btn-save'),
  list: document.getElementById('prompt-list'),
  search: document.getElementById('search-input'),
  btnNew: document.getElementById('btn-new'),
  btnCopy: document.getElementById('btn-copy'),
};

function updateEditableWrapperState(element, wrapper) {
  const hasText = element.textContent.trim().length > 0;
  wrapper.classList.toggle('is-empty', !hasText);
}

// Atualiza o estado de todos os elementos editáveis
function updateAllEditableStates() {
  updateEditableWrapperState(elements.promptTitle, elements.titleWrapper);
  updateEditableWrapperState(elements.promptContent, elements.contentWrapper);
}

// Adiciona ouvintes de evento input para atualizar wrappers em tempo real
function attachAllEditableHandlers() {
  elements.promptTitle.addEventListener('input', () => {
    updateEditableWrapperState(elements.promptTitle, elements.titleWrapper);
  });
  elements.promptContent.addEventListener('input', () => {
    updateEditableWrapperState(elements.promptContent, elements.contentWrapper);
  });
}

function openSidebar() {
  elements.sidebar.classList.add("open");
  elements.sidebar.classList.remove("collapsed");
}
function closeSidebar() {
  elements.sidebar.classList.remove("open")
  elements.sidebar.classList.add("collapsed")
}

function save() {
  const title = elements.promptTitle.innerHTML.trim();
  const content = elements.promptContent.innerHTML.trim();
  const hasContent = elements.promptContent.textContent.trim();

  if (!title || !hasContent) {
    alert('Por favor, preencha ambos os campos antes de salvar.');
    return;
  }

  if (state.selectedId) {
    //Editando um prompt existente
    const existingPrompt = state.prompts.find(p => p.id === state.selectedId);

    if (existingPrompt) {
      existingPrompt.title = title || 'Sem título';
      existingPrompt.content = content || "Sem conteúdo";
    }
  } else {
    //Criando um novo prompt
    const newPrompt = {
      id: Date.now().toString(36),
      title,
      content
    };

    state.prompts.unshift(newPrompt);
    state.selectedId = newPrompt.id;
  }
  renderList(elements.search.value);
  persist();
  alert('Prompt salvo com sucesso!');
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts));
  } catch (error) {
    console.error('Erro ao salvar os prompts:', error);
  }
}

function load() {
  try {
    const storage = localStorage.getItem(STORAGE_KEY);
    state.prompts = storage ? JSON.parse(storage) : [];
    state.selectedId = null;
  } catch (error) {
    console.error('Erro ao carregar os prompts:', error);
  }
}

function createPromptItem(prompt) {
  const tmp = document.createElement('div');
  tmp.innerHTML = prompt.content;

  return `
    <li class="prompt-item" data-id="${prompt.id}" data-action="select">
      <div class="prompt-item-content">
        <span class="prompt-item-title">${prompt.title}</span>
        <span class="prompt-item-description">${tmp.textContent}</span>
      </div>
        <button class="btn-icon" title="Remover" data-action="remove">
          <img 
            src="assets/remove.svg" 
            alt="remove item" 
            class="icon icon-trash"
          />
        </button>
    </li>
  `;
}

function renderList(filterText = '') {
  const filteredPrompts = state.prompts.filter(prompt =>
    prompt.title.toLowerCase().includes(filterText.toLowerCase().trim())
  ).map(p => createPromptItem(p)).join('');

  elements.list.innerHTML = filteredPrompts;
}

function newPrompt() {
  state.selectedId = null;
  elements.promptTitle.textContent = '';
  elements.promptContent.textContent = '';
  updateAllEditableStates();

  elements.promptTitle.focus();

}

function copySelected() {
  try {
    const content = elements.promptContent;

    if (!navigator.clipboard) {
      alert("A API de área de transferência não é suportada neste navegador.");
      return;
    }

    navigator.clipboard.writeText(content.innerText.trim());

    alert("Conteúdo copiado para a área de transferência!");

  } catch (error) {
    console.log('Erro ao copiar para a área de transferência. Tente novamente.');
  }
};

//Eventos 
elements.btnSave.addEventListener('click', save);
elements.btnNew.addEventListener('click', newPrompt);
elements.btnCopy.addEventListener('click', copySelected);

elements.search.addEventListener('input', (e) => {
  renderList(e.target.value);
})

elements.list.addEventListener('click', (e) => {
  const removeBtn = e.target.closest('[data-action="remove"]');
  const item = e.target.closest('[data-id]');

  if (!item) return;

  const id = item.getAttribute('data-id');
  state.selectedId = id;

  if (removeBtn) {
    state.prompts = state.prompts.filter(p => p.id !== id);
    renderList(elements.search.value);
    persist();
    return
  }

  if (e.target.closest('[data-action="select"]')) {
    const prompt = state.prompts.find(p => p.id === id);

    if (prompt) {
      elements.promptTitle.textContent = prompt.title;
      elements.promptContent.innerHTML = prompt.content;
      updateAllEditableStates();
    }
  }
})

// Função de inicialização
function init() {
  load();
  renderList("");
  attachAllEditableHandlers();
  updateAllEditableStates();

  elements.sidebar.classList.remove("open")
  elements.sidebar.classList.remove("collapsed")

  elements.btnOpen.addEventListener('click', openSidebar)
  elements.btnCollapse.addEventListener('click', closeSidebar)
}

// Executa a inicialização ao carregar o script
init();