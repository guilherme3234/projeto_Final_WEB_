# Importa as bibliotecas necessárias
from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd

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

    # Atualiza a despesa com o ID fornecido
    financas.loc[financas['ID'] == id, 'DESPESA'] = nova_despesa
    financas.loc[financas['ID'] == id, 'VALOR'] = novo_valor

    # Salva as alterações no arquivo Financas.csv
    financas.to_csv('Financas.csv', index=False)

    # Retorna as finanças atualizadas em formato JSON
    return jsonify(financas.to_dict('records'))


# Inicia a aplicação Flask
if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")
