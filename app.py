# Importa as bibliotecas necessárias
from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import os

# Cria a aplicação Flask
app = Flask(__name__)
CORS(app)

# Tenta criar o arquivo Financas.csv caso ele não exista e escreve o cabeçalho
try:
    open('Financas.csv', 'x')
    with open("Financas.csv", "a", encoding='utf-8') as arquivo:
        arquivo.write("ID,DESPESA,VALOR\n")
except:
    pass
try:
    open('Salarios.csv', 'x')
    with open("Salarios.csv", "a", encoding='utf-8') as arquivo:
        arquivo.write("SALARIO\n")
except:
    pass

# Lê o arquivo Salarios.csv e converte para um DataFrame
try:
    salarios = pd.read_csv('Salarios.csv')
except FileNotFoundError:
    # Se o arquivo não existir, inicializa o DataFrame vazio
    salarios = pd.DataFrame(columns=['SALARIO'])


# Define a rota para listar as finanças
@app.route("/list", methods=['GET'])
def listarFinancas():
    # Lê o arquivo Financas.csv e converte para um dicionário
    financas = pd.read_csv('Financas.csv')
    financas = financas.to_dict('records')
    # Retorna as finanças em formato JSON
    return jsonify(financas)


# Define a rota para adicionar uma despesa
@app.route("/add", methods=['POST'])
def addDespesa():
    # Obtém os dados enviados pelo cliente
    item = request.json
    # Lê o arquivo Financas.csv e converte para um DataFrame
    financas = pd.read_csv('Financas.csv')

    # Lê o arquivo Salarios.csv e converte para um DataFrame
    try:
        salarios = pd.read_csv('Salarios.csv')
    except FileNotFoundError:
        return jsonify({"error": "Salário não cadastrado"}), 404

    # Verifica se há salários cadastrados
    if salarios.empty:
        return jsonify({"error": "Salário não cadastrado"}), 404

    # Obtém o último salário cadastrado
    ultimo_salario = salarios['SALARIO'].iloc[-1]

    # Verifica se o salário é suficiente para a despesa
    if ultimo_salario < item['valor']:
        return jsonify({"error": "Salário insuficiente para cobrir a despesa"}), 400

    # Subtrai o valor da despesa do salário
    novo_salario = ultimo_salario - item['valor']

    # Atualiza o último salário no arquivo Salarios.csv
    salarios.loc[salarios.index[-1], 'SALARIO'] = novo_salario
    salarios.to_csv('Salarios.csv', index=False)

    # Define o ID da nova despesa
    if financas.empty:
        id_despesa = 1
    else:
        id_despesa = financas['ID'].max() + 1

    # Adiciona a nova despesa ao arquivo Financas.csv
    with open("Financas.csv", "a", encoding='utf-8') as arquivo:
        arquivo.write(f"{id_despesa},{item['despesa']},{item['valor']}\n")

    # Lê o arquivo Financas.csv e converte para um dicionário
    financas = pd.read_csv('Financas.csv')
    financas = financas.to_dict('records')
    # Retorna as finanças em formato JSON
    return jsonify(financas)


# Define a rota para deletar uma despesa
@app.route("/delete", methods=['DELETE'])
def deleteDespesa():
    # Obtém o ID da despesa a ser deletada do corpo da requisição
    data = request.json
    id = data.get('id')

    # Verifica se o ID foi fornecido
    if id is None:
        return jsonify({"error": "ID da despesa não fornecido"}), 400

    # Lê o arquivo Financas.csv e converte para um DataFrame
    financas = pd.read_csv('Financas.csv')

    # Verifica se a despesa com o ID fornecido existe
    if id not in financas['ID'].values:
        return jsonify({"error": "Despesa não encontrada"}), 404

    # Obtém o valor da despesa a ser excluída
    valor_despesa = financas.loc[financas['ID'] == id, 'VALOR'].values[0]

    # Lê o arquivo Salarios.csv e converte para um DataFrame
    try:
        salarios = pd.read_csv('Salarios.csv')
    except FileNotFoundError:
        return jsonify({"error": "Salário não cadastrado"}), 404

    # Verifica se há salários cadastrados
    if salarios.empty:
        return jsonify({"error": "Salário não cadastrado"}), 404

    # Obtém o último salário cadastrado
    ultimo_salario = salarios['SALARIO'].iloc[-1]

    # Adiciona o valor da despesa de volta ao salário
    novo_salario = ultimo_salario + valor_despesa

    # Atualiza o último salário no arquivo Salarios.csv
    salarios.loc[salarios.index[-1], 'SALARIO'] = novo_salario
    salarios.to_csv('Salarios.csv', index=False)

    # Remove a despesa com o ID fornecido
    financas = financas.drop(financas[financas['ID'] == id].index)

    # Reajusta os IDs após a exclusão
    financas['ID'] = range(1, len(financas) + 1)

    # Salva as alterações no arquivo Financas.csv
    financas.to_csv('Financas.csv', index=False)

    # Retorna as finanças atualizadas em formato JSON
    return jsonify(financas.to_dict('records'))


# Define a rota para atualizar uma despesa
@app.route("/update/<int:id>", methods=["PUT"])
def updateDespesa(id):
    # Obtém os dados atualizados do corpo da requisição
    nova_despesa = request.json.get('despesa')
    novo_valor = request.json.get('valor')

    # Lê o arquivo Financas.csv e converte para um DataFrame
    financas = pd.read_csv('Financas.csv')

    # Verifica se a despesa com o ID fornecido existe
    if id not in financas['ID'].values:
        return jsonify({"error": "Despesa não encontrada"}), 404

    # Obtém o registro da despesa com o ID fornecido
    despesa = financas[financas['ID'] == id].iloc[0]

    # Calcula a diferença entre o novo valor e o valor atual
    diferenca_valor = novo_valor - despesa['VALOR']

    # Lê o arquivo Salarios.csv e converte para um DataFrame
    try:
        salarios = pd.read_csv('Salarios.csv')
    except FileNotFoundError:
        return jsonify({"error": "Salário não cadastrado"}), 404

    # Verifica se há salários cadastrados
    if salarios.empty:
        return jsonify({"error": "Salário não cadastrado"}), 404

    # Obtém o último salário cadastrado
    ultimo_salario = salarios['SALARIO'].iloc[-1]

    # Verifica se o salário é suficiente para cobrir a diferença
    if ultimo_salario < diferenca_valor:
        return jsonify({"error": "Salário insuficiente para cobrir a diferença da despesa"}), 400

    # Subtrai a diferença do salário
    novo_salario = ultimo_salario - diferenca_valor

    # Atualiza o último salário no arquivo Salarios.csv
    salarios.loc[salarios.index[-1], 'SALARIO'] = novo_salario
    salarios.to_csv('Salarios.csv', index=False)

    # Atualiza a despesa com o ID fornecido
    financas.loc[financas['ID'] == id, 'DESPESA'] = nova_despesa
    financas.loc[financas['ID'] == id, 'VALOR'] = novo_valor

    # Salva as alterações no arquivo Financas.csv
    financas.to_csv('Financas.csv', index=False)

    # Retorna as finanças atualizadas em formato JSON
    return jsonify(financas.to_dict('records'))


# Rota para somar as despesas 
@app.route("/sum", methods=["GET"])
def sumDespesas():
    # Lê o arquivo Financas.csv e converte para um DataFrame
    financas = pd.read_csv('Financas.csv')

    # Verifica se o arquivo está vazio
    if financas.empty:
        return jsonify({"error": "Nenhuma despesa cadastrada"}), 404

    # Soma os valores das despesas
    total = financas['VALOR'].sum()

    # Converte o valor para um tipo nativo do Python
    total = float(total)

    # Retorna o total em formato JSON
    return jsonify({"total": total})

@app.route("/add_salary", methods=['POST'])
def addSalary():
    # Obtém os dados enviados pelo cliente
    salario_data = request.json

    # Lê o arquivo Salarios.csv e converte para um DataFrame
    try:
        salarios = pd.read_csv('Salarios.csv')
    except FileNotFoundError:
        # Se o arquivo não existir, cria um novo
        with open("Salarios.csv", "w", encoding='utf-8') as arquivo:
            arquivo.write("SALARIO\n")
        salarios = pd.DataFrame(columns=['SALARIO'])

    # Adiciona o novo salário ao arquivo Salarios.csv
    with open("Salarios.csv", "a", encoding='utf-8') as arquivo:
        arquivo.write(f"{salario_data['salario']}\n")

    # Lê o arquivo Salarios.csv e converte para um dicionário
    salarios = pd.read_csv('Salarios.csv')
    salarios = salarios.to_dict('records')

    # Retorna os salários em formato JSON
    return jsonify(salarios)
# Rota para listar os salários
@app.route("/list_salary", methods=['GET'])
def listSalaries():
    # Lê o arquivo Salarios.csv e converte para um dicionário
    salarios = pd.read_csv('Salarios.csv')
    salarios = salarios.to_dict('records')

    # Retorna os salários em formato JSON
    return jsonify(salarios)
    
# Rota para atualizar o salário
@app.route("/update_salary", methods=["PUT"])
def updateSalary():
    # Obtém os dados atualizados do corpo da requisição
    novo_salario = request.json.get('salario')

    # Verifica se o arquivo Salarios.csv existe
    if not os.path.isfile('Salarios.csv'):
        return jsonify({"error": "Arquivo Salarios.csv não encontrado"}), 404

    # Lê o arquivo Salarios.csv e converte para um DataFrame
    salarios = pd.read_csv('Salarios.csv')

    # Atualiza o salário existente, se houver
    if not salarios.empty:
        salarios.loc[:, 'SALARIO'] = novo_salario
        salarios.to_csv('Salarios.csv', index=False)
        return jsonify({"message": "Salário atualizado com sucesso"}), 200
    
    # Se não houver salário cadastrado, adiciona um novo
    with open("Salarios.csv", "w", encoding='utf-8') as arquivo:
        arquivo.write("SALARIO\n")
    salarios = pd.DataFrame(columns=['SALARIO'])
    salarios.loc[0, 'SALARIO'] = novo_salario
    salarios.to_csv('Salarios.csv', index=False)
    return jsonify({"message": "Salário adicionado com sucesso"}), 200


    return jsonify({"error": "Salário não encontrado"}), 404


# Inicia a aplicação Flask
if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")
