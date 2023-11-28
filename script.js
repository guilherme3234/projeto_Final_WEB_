document.addEventListener('DOMContentLoaded', function() {
    const tabela = document.querySelector(".tabela-js");
  
    axios.get(`https://api.augustin06.repl.co/list`)
      .then(function(resposta) {
        getData(resposta.data);
      })
      .catch(function(error) {
        console.error(error);
      });
  
    function getData(dados) {
      tabela.innerHTML = dados.map(item => `
          <tr>
          <th scope="row">${item.ID}</th>
          <td>${item.TAREFA}</td>
          <td><button class="btn bg-white delete-btn" type="button" data-bs-toggle="modal" data-bs-target="#modalDel"><span class="material-symbols-outlined text-danger">
          delete
          </span></button> <button class="btn bg-white edit-btn" id="edit-tarefa-btn"  type="button" data-bs-toggle="modal" data-bs-target="#modalEdit"><span class="material-symbols-outlined text-success">
          edit
          </span></button></td>
      </tr>`
      ).join('');
  
      todos_Eventos();
    };
  
    function todos_Eventos() {
      // ADICIONA NOVA TAREFA
      document.querySelector("#add-tarefa").addEventListener("click", function() { // ADICIONA TAREFA
        const tarefa = document.querySelector("#tarefa").value; // PEGA O VALOR DO INPUT
        if (tarefa === "") {    // VERIFICA SE O INPUT ESTA VAZIO
          alert("Digite uma tarefa!");    // SE ESTIVER VAZIO, RETORNA UM ALERTA
          return; // E PARA A EXECUÇÃO DO CODIGO
        }
  
        axios.post(`https://api.augustin06.repl.co/add`, { Tarefa: tarefa })
          .then(function() {
            location.reload()
          })
          .catch(function(error) {
            console.error(error);
          });
      });
  
      // EXCLUIR TAREFA
      document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", function(e) {
          const id = e.target.closest("tr").querySelector("th").textContent;
          axios.delete(`https://api.augustin06.repl.co/delete`, { data: { id: parseInt(id) } })
            .then(function() {
              loadTasks();
            })
            .catch(function(error) {
              console.error(error);
            });
        });
      });
  
      function updateTarefa(id, novaTarefa) {
        axios.put(`https://api.augustin06.repl.co/update/${id}`, { TAREFA: novaTarefa })
          .then(function() {
            Carregar(); // RECARREGA A LISTA DEPOIS DE USAR
          })
          .catch(function(error) {
            console.error(error);
          });
      }
  
      // EDITAR TAREFA
      document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", function(e) {
          const id = e.target.closest("tr").querySelector("th").textContent;
          const novaTarefa = prompt("Digite a nova descrição da tarefa:");
  
          if (novaTarefa !== null) {
            updateTarefa(parseInt(id), novaTarefa);
          }
        });
      });
  
  
  
    }
  
    // CARREGAR TAREFAS NA PAGINA
    function loadTasks() {
      axios.get(`https://api.augustin06.repl.co/list`)
        .then(function(resposta) {
          getData(resposta.data);
        })
        .catch(function(error) {
          console.error(error);
        });
    }
  });