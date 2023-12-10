// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Função para carregar as despesas na tabela
    
    async function carregarDespesas() {
        try {
            // Carrega as despesas
            const responseDespesas = await axios.get('http://127.0.0.1:5000/list');
            const despesas = responseDespesas.data;
    
            // Carrega o salário
            const responseSalario = await axios.get('http://127.0.0.1:5000/list_salary');
            const salario = responseSalario.data[0]; // Assume que há apenas um salário na lista
    
            // Atualiza o salário exibido no modal principal
            document.getElementById('user-salary').innerText = salario.SALARIO.toFixed(2);
    
            // Atualiza a tabela de despesas
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
    
    
    async function carregarGrafico() {
        try {
            // Carrega o total de despesas
            const responseTotalDespesas = await axios.get('http://127.0.0.1:5000/sum');
            const totalDespesas = responseTotalDespesas.data.total;
    
            // Carrega o salário
            const responseSalario = await axios.get('http://127.0.0.1:5000/list_salary');
            const salario = responseSalario.data[0]; // Assume que há apenas um salário na lista
    
            // Calcula o restante do salário após despesas
            const restanteSalario = salario.SALARIO - totalDespesas;
    
            // Obtém o contexto do canvas
            const ctx = document.getElementById('donutChart').getContext('2d');
    
            // Cria o gráfico de rosca
            const myChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Saldo atual \n R$:', 'Despesas \n R$:'],
                    datasets: [{
                        data: [salario.SALARIO, totalDespesas],
                        backgroundColor: ['rgba(153, 102, 255, 0.8)', 'rgba(75, 192, 192, 0.8)'],
                    }],
                },
                options: {
                    plugins: {
                        legend: {
                            display: true,
                            position: 'bottom',
                        },
                    },
                },
            });
        } catch (error) {
            console.error('Erro ao carregar gráfico:', error.message);
        }
    }
    
    // Carrega o gráfico ao carregar a página
    carregarGrafico();
    // Função para adicionar uma nova despesa
    // Função para adicionar uma nova despesa
    async function adicionarDespesa() {
        const despesaInput = document.querySelector("#recipient-name");
        const valorInput = document.querySelector("#recipient-valor");
        const errorMessage = document.getElementById('error-message');
    
        const despesa = despesaInput.value;
        const valor = parseFloat(valorInput.value.replace(',', '.'));
    
        if (!despesa || isNaN(valor)) {
            errorMessage.innerText = 'Preencha os campos corretamente.';
            return;
        }
    
        try {
            // Obtém o salário atual
            const responseSalario = await axios.get('http://127.0.0.1:5000/list_salary');
            const salario = responseSalario.data[0]; // Assume que há apenas um salário na lista
            // Verifica se o salário é suficiente para cobrir a despesa
            if (salario.SALARIO <= 0 || salario.SALARIO < valor) {
                errorMessage.innerText = 'Salário insuficiente para cobrir a despesa.';
                return;
            }
    
            // Adiciona a nova despesa ao servidor
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
    
            // Limpa a mensagem de erro
            errorMessage.innerText = '';
    
            // Recarrega a página
            location.reload();
        } catch (error) {
            console.error('Erro ao adicionar despesa:', error.message);
        }
    }
    // Exibir gastos mensais, somente um get com soma de todos os valores
    
    
    
    // Função para editar o salário
    
    
    // Carrega as despesas ao carregar a página
    carregarDespesas();
    // Adiciona um ouvinte de evento ao botão de adicionar no modal
    document.querySelector("#addDespesaBtn").addEventListener("click", adicionarDespesa);
    
    });
    function excluirDespesa(id) {
        // Define o ID da despesa que está sendo excluída
        document.getElementById('deleteDespesaBtn').dataset.id = id;
        
        // Exibe a modal de exclusão
        const modalDel = new bootstrap.Modal(document.getElementById('modalDel'));
        modalDel.show();
    }
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
      function editarDespesa(id, despesaAtual, valorAtual) {
        // Preenche os campos da modal de edição
        document.getElementById('edit-despesa').value = despesaAtual;
        document.getElementById('edit-valor').value = valorAtual.toFixed(2);
        
        
        // Define o ID da despesa que está sendo editada
        document.getElementById('editDespesaBtn').dataset.id = id;
        document.getElementById('cancelarEdicaoBtn').addEventListener('click', function() {
            const modalEdit = new bootstrap.Modal(document.getElementById('modalEdit'));
            modalEdit.hide();
        });
    }
    async function editarDespesaConfirmado() {
        const id = document.getElementById('editDespesaBtn').dataset.id;
        const novoDespesa = document.getElementById('edit-despesa').value;
        const novoValor = parseFloat(document.getElementById('edit-valor').value.replace(',', '.'));
    
        if (!novoDespesa || isNaN(novoValor)) {
            alert('Preencha os campos corretamente.');
            return;
        }
    
        try {
            const response = await axios.put(`http://127.0.0.1:5000/update/${id}`, { despesa: novoDespesa, valor: novoValor });
            console.log(response.data);
    
            // Recarrega a tabela
            carregarDespesas();
    
            // Fecha a modal de edição
            const modalEdit = new bootstrap.Modal(document.getElementById('modalEdit'));
            modalEdit.hide();
        } catch (error) {
            console.error('Erro ao editar despesa:', error.message);
        }
    }
      async function editarSalario() {
        const novoSalarioInput = document.getElementById('edit-salary-input');
        const novoSalario = parseFloat(novoSalarioInput.value.replace(',', '.'));
    
        if (isNaN(novoSalario)) {
            alert('Digite um valor válido para o salário.');
            return;
        }
    
        try {
            const response = await axios.put('http://127.0.0.1:5000/update_salary', { salario: novoSalario });
            console.log(response.data);
    
            // Atualiza o salário exibido no modal principal
            document.getElementById('user-salary').innerText = novoSalario.toFixed(2);
    
            // Fecha o modal de edição de salário
            const modal = new bootstrap.Modal(document.getElementById('modalEditSalary'));
            modal.hide();
        } catch (error) {
            console.error('Erro ao editar salário:', error.message);
        }
    }
    async function mostrarGastosMensais() {
        try {
            // Faz a requisição para obter a soma de todas as despesas
            const responseTotalDespesas = await axios.get('http://127.0.0.1:5000/sum');
            const totalDespesas = responseTotalDespesas.data.total;
    
            // Exibe a soma na modal de gastos mensais
            const modalGastosMensais = new bootstrap.Modal(document.getElementById('Modal2'));
            const modalBody = modalGastosMensais._element.querySelector('.modal-body');
            modalBody.innerHTML = `<p>Total de Gastos Mensais: R$ ${totalDespesas.toFixed(2)}</p>`;
    
            // Abre a modal
            modalGastosMensais.show();
            // fecha a modal
            
        } catch (error) {
            console.error('Erro ao carregar gastos mensais:', error.message);
        }
    }
    
    // Adiciona um ouvinte de evento ao botão de gastos mensais no modal principal
document.querySelector("#btn-gastos-mensais").addEventListener("click", mostrarGastosMensais);
