// script.js

// Função para carregar as despesas na tabela
async function carregarDespesas() {
  try {
      const response = await axios.get('http://127.0.0.1:5000/list');
      const despesas = response.data;

      const tabela = document.querySelector('.tabela-js');
      tabela.innerHTML = '';

      despesas.forEach(despesa => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
          <td>${despesa.ID}</td>
          <td>${despesa.DESPESA}</td>
          <td>R$ ${despesa.VALOR.toFixed(2)}</td>
          <td>
              <button class="btn bg-white delete-btn" type="button" data-bs-toggle="modal" data-bs-target="#modalDel" onclick="excluirDespesa(${despesa.ID})">
                  <span class="material-symbols-outlined text-danger">delete</span>
              </button>
              <button class="btn bg-white edit-btn" id="edit-tarefa-btn" type="button" data-bs-toggle="modal" data-bs-target="#modalEdit" onclick="editarDespesa(${despesa.ID}, '${despesa.DESPESA}', ${despesa.VALOR})">
                  <span class="material-symbols-outlined text-success">edit</span>
              </button>
          </td>
          
          `;
          tabela.appendChild(tr);
      });
  } catch (error) {
      console.error('Erro ao carregar despesas:', error.message);
  }
}

// Função para adicionar uma nova despesa


// Função para editar uma despesa
async function editarDespesa(id, despesaAtual, valorAtual) {
  const novoDespesa = prompt('Digite a nova despesa:', despesaAtual);
  const novoValor = parseFloat(prompt('Digite o novo valor:', valorAtual).replace(',', '.'));

  if (!novoDespesa || isNaN(novoValor)) {
      alert('Preencha os campos corretamente.');
      return;
  }

  try {
      const response = await axios.put(`http://127.0.0.1:5000/update/${id}`, { despesa: novoDespesa, valor: novoValor });
      console.log(response.data);

      // Recarrega a tabela
      carregarDespesas();
  } catch (error) {
      console.error('Erro ao editar despesa:', error.message);
  }
}

// Função para excluir uma despesa
// Função para excluir uma despesa
function excluirDespesa(id) {
  // Mostra uma caixa de diálogo de confirmação
  const confirmacao = window.confirm('Deseja realmente excluir esta despesa?');

  // Se o usuário confirmar, prossegue com a exclusão
  if (confirmacao) {
      axios.delete('http://127.0.0.1:5000/delete', { data: { id } })
          .then(function (response) {
              console.log(response.data);

              // Recarrega a tabela
              carregarDespesas();
          })
          .catch(function (error) {
              console.error('Erro ao excluir despesa:', error.message);
          });
  }
}

// Função para adicionar uma nova despesa
async function adicionarDespesa() {
  const despesaInput = document.querySelector("#recipient-name");
  const valorInput = document.querySelector("#recipient-valor");

  const despesa = despesaInput.value;
  const valor = parseFloat(valorInput.value.replace(',', '.'));

  if (!despesa || isNaN(valor)) {
    alert('Preencha os campos corretamente.');
    return;
  }

  try {
    const response = await axios.post(`http://127.0.0.1:5000/add`, { despesa: despesa, valor: valor });
    console.log(response.data);

    // Recarrega a tabela
    carregarDespesas();

    // Limpa os campos de entrada após adicionar a despesa
    despesaInput.value = '';
    valorInput.value = '';

    // Fecha o modal de adicionar despesa
    const modal = new bootstrap.Modal(document.getElementById('Modal3'));
    modal.hide();
  } catch (error) {
    console.error('Erro ao adicionar despesa:', error.message);
  }
}

async function carregarSalario() {
  try {
      const response = await axios.get('http://127.0.0.1:5000/list_salary');
      const salarios = response.data;

      if (salarios.length > 0) {
          const ultimoSalario = salarios[salarios.length - 1].SALARIO;
          document.getElementById('user-salary').textContent = ultimoSalario.toFixed(2);
      } else {
          // Caso o usuário não tenha salário cadastrado
          document.getElementById('user-salary').textContent = 'N/A';
      }
  } catch (error) {
      console.error('Erro ao carregar salário:', error.message);
  }
}
async function editarSalario() {
  const novoSalario = parseFloat(document.getElementById('edit-salary-input').value.replace(',', '.'));

  if (isNaN(novoSalario)) {
      alert('Por favor, insira um valor válido para o salário.');
      return;
  }

  try {
      const response = await axios.put('http://127.0.0.1:5000/update_salary', { salario: novoSalario });
      console.log(response.data);

      // Recarrega o salário após a edição
      carregarSalario();

      // Fecha o modal de edição
      const modalEditSalary = new bootstrap.Modal(document.getElementById('modalEditSalary'));
      modalEditSalary.hide();
  } catch (error) {
      console.error('Erro ao editar salário:', error.message);
  }
}
async function carregarSalario() {
  try {
      const response = await axios.get('http://127.0.0.1:5000/list_salary');
      const salarios = response.data;

      if (salarios.length > 0) {
          const ultimoSalario = salarios[salarios.length - 1].SALARIO;
          document.getElementById('user-salary').textContent = ultimoSalario.toFixed(2);
      } else {
          // Caso o usuário não tenha salário cadastrado
          document.getElementById('user-salary').textContent = 'N/A';
      }
  } catch (error) {
      console.error('Erro ao carregar salário:', error.message);
  }
}


// Chame a função para carregar o salário ao carregar a página
carregarSalario();


// Carrega as despesas ao carregar a página
carregarDespesas();
// Adiciona um ouvinte de evento ao botão de adicionar no modal
document.querySelector("#addDespesaBtn").addEventListener("click", adicionarDespesa);

