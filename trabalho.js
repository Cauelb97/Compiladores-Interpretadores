import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.tree.*;
import java.util.HashMap;
import java.util.Scanner;

public class CalculadoraMain {
    // Mapa para armazenar as variáveis
    static HashMap<String, Double> memoria = new HashMap<>();
    static Scanner scanner = new Scanner(System.in);

    public static void main(String[] args) throws Exception {
        // Leitura do input
        CharStream input = CharStreams.fromStream(System.in);

        // Lexer e Parser
        CalculadoraLexer lexer = new CalculadoraLexer(input);
        CommonTokenStream tokens = new CommonTokenStream(lexer);
        CalculadoraParser parser = new CalculadoraParser(tokens);

        // Inicia a análise
        ParseTree tree = parser.programa();
        ParseTreeWalker walker = new ParseTreeWalker();

        // Interpreta a árvore gerada
        CalculadoraBaseListener listener = new CalculadoraBaseListener() {
            @Override
            public void exitComandoImpressao(CalculadoraParser.ComandoImpressaoContext ctx) {
                double valor = eval(ctx.expr());
                System.out.println("Resultado: " + valor);
            }

            @Override
            public void exitComandoLeitura(CalculadoraParser.ComandoLeituraContext ctx) {
                System.out.print("Digite o valor de " + ctx.VAR().getText() + ": ");
                double valor = scanner.nextDouble();
                memoria.put(ctx.VAR().getText(), valor);
            }

            @Override
            public void exitComandoAtribuicao(CalculadoraParser.ComandoAtribuicaoContext ctx) {
                String var = ctx.VAR().getText();
                double valor = eval(ctx.expr());
                memoria.put(var, valor);
            }

            // Função para avaliar expressões
            private double eval(CalculadoraParser.ExprContext ctx) {
                if (ctx instanceof CalculadoraParser.AdicaoSubtracaoContext) {
                    CalculadoraParser.AdicaoSubtracaoContext c = (CalculadoraParser.AdicaoSubtracaoContext) ctx;
                    double left = eval(c.expr(0));
                    double right = eval(c.expr(1));
                    if (c.op.getType() == CalculadoraParser.ADD) {
                        return left + right;
                    } else {
                        return left - right;
                    }
                } else if (ctx instanceof CalculadoraParser.MultiplicacaoDivisaoContext) {
                    CalculadoraParser.MultiplicacaoDivisaoContext c = (CalculadoraParser.MultiplicacaoDivisaoContext) ctx;
                    double left = eval(c.expr(0));
                    double right = eval(c.expr(1));
                    if (c.op.getType() == CalculadoraParser.MUL) {
                        return left * right;
                    } else {
                        return left / right;
                    }
                } else if (ctx instanceof CalculadoraParser.ParentesesContext) {
                    return eval(((CalculadoraParser.ParentesesContext) ctx).expr());
                } else if (ctx instanceof CalculadoraParser.NumeroContext) {
                    return Double.parseDouble(ctx.getText());
                } else if (ctx instanceof CalculadoraParser.VariavelContext) {
                    String var = ctx.getText();
                    if (memoria.containsKey(var)) {
                        return memoria.get(var);
                    } else {
                        throw new RuntimeException("Variável não definida: " + var);
                    }
                }
                return 0;
            }
        };

        // Caminha pela árvore
        walker.walk(listener, tree);
    }
}
