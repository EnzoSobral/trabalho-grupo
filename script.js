// ============================================================
//  auth.js  –  Lógica de Login e Cadastro
//  Utiliza localStorage para simular um banco de dados simples
// ============================================================

// ----------------------------------------------------------
// 1. FUNÇÕES DE VALIDAÇÃO (reutilizáveis em qualquer tela)
// ----------------------------------------------------------

/**
 * Valida se o e-mail tem formato correto (ex: nome@dominio.com)
 * @param {string} email
 * @returns {boolean}
 */
function validarEmail(email) {
  // Expressão regular que cobre os formatos mais comuns de e-mail
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(emailtrim());
}

/**
 * Valida se a senha possui no mínimo 8 caracteres
 * @param {string} senha
 * @returns {boolean}
 */
function validarSenha(senha) {
  return senha.length >= 8;
}

/**
 * Exibe uma mensagem de erro abaixo de um campo
 * @param {string} campoId  – id do <input>
 * @param {string} mensagem – texto do erro
 */
function mostrarErro(campoId, mensagem) {
  const campo = document.getElementById(campoId);
  // Remove erro anterior (se existir)
  removerErro(campoId);

  // Cria o elemento de erro
  const erro = document.createElement("span");
  erro.className = "mensagem-erro";
  erro.id = `erro-${campoId}`;
  erro.textContent = mensagem;
  erro.style.cssText =
    "color:#c0392b; font-size:12px; display:block; margin-top:4px;";

  campo.style.borderColor = "#c0392b";
  campo.insertAdjacentElement("afterend", erro);
}

/**
 * Remove a mensagem de erro de um campo
 * @param {string} campoId
 */
function removerErro(campoId) {
  const erroExistente = document.getElementById(`erro-${campoId}`);
  if (erroExistente) erroExistente.remove();

  const campo = document.getElementById(campoId);
  if (campo) campo.style.borderColor = "#ccc";
}

/**
 * Exibe um alerta estilizado na tela (substituindo o alert() padrão)
 * @param {string} mensagem
 * @param {'sucesso'|'erro'} tipo
 */
function mostrarAlerta(mensagem, tipo) {
  // Remove alerta anterior
  const alertaExistente = document.getElementById("alerta-global");
  if (alertaExistente) alertaExistente.remove();

  const alerta = document.createElement("div");
  alerta.id = "alerta-global";
  alerta.textContent = mensagem;

  const cor = tipo === "sucesso" ? "#27ae60" : "#c0392b";
  alerta.style.cssText = `
    background:${cor}; color:#fff; padding:12px 16px;
    border-radius:8px; margin-bottom:16px; font-size:14px;
    text-align:center; animation: fadeIn .3s ease;
  `;

  // Insere no topo do formulário
  const container = document.querySelector(".login-container");
  container.insertBefore(alerta, container.querySelector("h1").nextSibling);

  // Desaparece após 4 segundos
  setTimeout(() => alerta.remove(), 4000);
}

// ----------------------------------------------------------
// 2. FUNÇÕES DO "BANCO DE DADOS" (localStorage)
// ----------------------------------------------------------

/**
 * Retorna todos os usuários cadastrados
 * @returns {Array<{email: string, senha: string}>}
 */
function obterUsuarios() {
  return JSON.parse(localStorage.getItem("usuarios") || "[]");
}

/**
 * Salva a lista de usuários no localStorage
 * @param {Array} usuarios
 */
function salvarUsuarios(usuarios) {
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

/**
 * Busca um usuário pelo e-mail
 * @param {string} email
 * @returns {object|undefined}
 */
function buscarUsuario(email) {
  return obterUsuarios().find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
}

// ----------------------------------------------------------
// 3. LÓGICA DE CADASTRO
// ----------------------------------------------------------

/**
 * Cadastra um novo usuário após validar os campos
 * Chamada pelo botão "Cadastrar" na tela de login
 */
function cadastrar() {
  const email = document.getElementById("Email").value;
  const senha = document.getElementById("Senha").value;

  // Limpa erros anteriores
  removerErro("Email");
  removerErro("Senha");

  let valido = true;

  // Valida e-mail
  if (!validarEmail(email)) {
    mostrarErro("Email", "Digite um e-mail válido (ex: nome@email.com).");
    valido = false;
  }

  // Valida senha
  if (!validarSenha(senha)) {
    mostrarErro("Senha", "A senha deve ter no mínimo 8 caracteres.");
    valido = false;
  }

  if (!valido) return; // Interrompe se houver erros

  // Verifica se o e-mail já está cadastrado
  if (buscarUsuario(email)) {
    mostrarAlerta("Este e-mail já está cadastrado. Faça login.", "erro");
    return;
  }

  // Salva o novo usuário
  const usuarios = obterUsuarios();
  usuarios.push({ email: email.trim(), senha });
  salvarUsuarios(usuarios);

  mostrarAlerta("Cadastro realizado com sucesso! Agora faça login.", "sucesso");

  // Limpa os campos após o cadastro
  document.getElementById("Email").value = "";
  document.getElementById("Senha").value = "";
}

// ----------------------------------------------------------
// 4. LÓGICA DE LOGIN
// ----------------------------------------------------------

/**
 * Faz o login validando os campos e verificando o cadastro
 * Chamada pelo botão "Acessar"
 */
function fazerLogin() {
  const email = document.getElementById("Email").value;
  const senha = document.getElementById("Senha").value;

  // Limpa erros anteriores
  removerErro("Email");
  removerErro("Senha");

  let valido = true;

  // Valida formato do e-mail
  if (!validarEmail(email)) {
    mostrarErro("Email", "Digite um e-mail válido (ex: nome@email.com).");
    valido = false;
  }

  // Valida tamanho mínimo da senha
  if (!validarSenha(senha)) {
    mostrarErro("Senha", "A senha deve ter no mínimo 8 caracteres.");
    valido = false;
  }

  if (!valido) return; // Interrompe se houver erros

  // Verifica se o usuário existe e a senha está correta
  const usuario = buscarUsuario(email);

  if (!usuario || usuario.senha !== senha) {
    mostrarAlerta("E-mail ou senha incorretos.", "erro");
    return;
  }

  // Login OK: salva sessão e redireciona
  localStorage.setItem("usuarioLogado", email);
  mostrarAlerta("Login realizado! Redirecionando...", "sucesso");

  setTimeout(() => {
    window.location.href = "index.html";
  }, 1500);
}

// ----------------------------------------------------------
// 5. VERIFICAÇÃO DE SESSÃO (usada na página da loja)
// ----------------------------------------------------------

/**
 * Redireciona para o login se o usuário não estiver logado.
 * Chame esta função no topo de páginas protegidas (ex: index.html).
 */
function verificarSessao() {
  const logado = localStorage.getItem("usuarioLogado");
  if (!logado) {
    alert("Você precisa fazer login para acessar esta página.");
    window.location.href = "index2.html";
  }
}

/**
 * Faz o logout do usuário
 */
function sair() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index2.html";
}

// ----------------------------------------------------------
// 6. VALIDAÇÃO EM TEMPO REAL (feedback enquanto o usuário digita)
// ----------------------------------------------------------

// Só executa se estiver na tela de login (elemento #Email existe)
document.addEventListener("DOMContentLoaded", () => {
  const campoEmail = document.getElementById("Email");
  const campoSenha = document.getElementById("Senha");

  if (campoEmail) {
    campoEmail.addEventListener("input", () => {
      if (campoEmail.value && !validarEmail(campoEmail.value)) {
        mostrarErro("Email", "Formato de e-mail inválido.");
      } else {
        removerErro("Email");
      }
    });
  }

  if (campoSenha) {
    campoSenha.addEventListener("input", () => {
      if (campoSenha.value && !validarSenha(campoSenha.value)) {
        mostrarErro("Senha", `Mínimo 8 caracteres (${campoSenha.value.length}/8)`);
      } else {
        removerErro("Senha");
      }
    });
  }
});
