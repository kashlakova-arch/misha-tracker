/* Тесты логики статусов. Запуск: node tests.js
   Харнесс вырезает из index.html блок правил и функцию evaluate() и прогоняет сценарии. */
var fs = require("fs");

var html = fs.readFileSync(__dirname + "/index.html", "utf8");
var a = html.indexOf("var RULES = {");
var b = html.indexOf("var STATUS_TEXT =");
if(a < 0 || b < 0){ console.error("Не найдены маркеры RULES / STATUS_TEXT в index.html"); process.exit(2); }

var mod = new Function(html.slice(a, b) + "\nreturn { evaluate: evaluate, RULES: RULES };")();
var evaluate = mod.evaluate;

/* Профиль с хронической хромотой 2 на заднюю левую и известной нормой температуры */
var P = { name:"Миша", skips:1, limpNorm:2, limpPaw:"bl", tempNorm:38.5 };
/* Здоровый профиль без хромоты */
var P0 = { name:"Миша", skips:0, limpNorm:0, limpPaw:"none", tempNorm:null };
/* Норма хромоты «по-разному» */
var PV = { name:"Миша", skips:0, limpNorm:2, limpPaw:"vary", tempNorm:null };

var base = {
  general:"normal", collapse:"none", urine:"normal", gums:"normal",
  appetite:"normal", limp:0, limpPaw:"none", vomit:"none", breathing:"normal", temp:undefined
};
function A(o){ return Object.assign({}, base, o); }

var fail = 0;
function check(name, ans, prof, want){
  var r = evaluate(ans, prof);
  var ok = r.status === want;
  if(!ok) fail++;
  var pad = name.length < 48 ? name + Array(48 - name.length).join(" ") : name;
  console.log((ok ? "  ok  " : " FAIL ") + pad + " -> " + r.status +
    (ok ? "" : "  (ждали " + want + ")") +
    (r.red.concat(r.yellow).length ? "   " + r.red.concat(r.yellow).join(" | ") : ""));
}

/* ── зелёный: норма и единичные мелочи ── */
check("всё как обычно", A({}), P, "green");
check("привычная хромота 2 на ту же лапу", A({limp:2, limpPaw:"bl"}), P, "green");
check("единичный пропуск еды", A({appetite:"skip1"}), P, "green");
check("съел меньше — одно отличие", A({appetite:"less"}), P, "green");
check("пропустил несколько при норме 1", A({appetite:"skip2"}), P, "green");
check("однократная рвота, состояние обычное", A({vomit:"once"}), P, "green");
check("необычно красные дёсны — одно отличие", A({gums:"red"}), P, "green");
check("тяжелее дышит — одно отличие", A({breathing:"heavy"}), P, "green");
check("температура 38.9 — норма", A({temp:38.9}), P, "green");
check("температура 39.6 без ухудшения", A({temp:39.6}), P, "green");
check("норма «по-разному», лапа другая", A({limp:2, limpPaw:"fr"}), PV, "green");
check("не видели только мочу", A({urine:"unknown"}), P, "green");

/* ── жёлтый: сумма мелочей ── */
check("2+ небольших отличия (тише + меньше ел)", A({general:"quiet", appetite:"less"}), P, "yellow");
check("красные дёсны + однократная рвота", A({gums:"red", vomit:"once"}), P, "yellow");
check("тяжело дышит + тише обычного", A({breathing:"heavy", general:"quiet"}), P, "yellow");

/* ── жёлтый: отклонение от личной нормы ── */
check("явное ухудшение состояния", A({general:"worse"}), P, "yellow");
check("не ест больше суток", A({appetite:"fast24"}), P, "yellow");
check("повторная рвота без ухудшения", A({vomit:"repeated"}), P, "yellow");
check("хромота 3 при норме 2", A({limp:3, limpPaw:"bl"}), P, "yellow");
check("хромота 2 на другую лапу", A({limp:2, limpPaw:"fr"}), P, "yellow");
check("новая хромота при норме 0", A({limp:1, limpPaw:"fl"}), P0, "yellow");
check("температура 40.2 без перегрева", A({temp:40.2}), P, "yellow");
check("температура 39.6 при ухудшении (не красный)", A({temp:39.6, general:"worse"}), P, "yellow");

/* ── красный: жёсткие признаки, норма не важна ── */
check("тёмная моча", A({urine:"dark"}), P, "red");
check("очень бледные дёсны", A({gums:"pale"}), P, "red");
check("желтоватые дёсны", A({gums:"yellow"}), P, "red");
check("затруднённое дыхание", A({breathing:"labored"}), P, "red");
check("резкая слабость и шаткость", A({collapse:"weak"}), P, "red");
check("потеря сознания", A({collapse:"faint"}), P, "red");
check("рвота с кровью", A({vomit:"blood"}), P, "red");
check("повторная рвота + явное ухудшение", A({vomit:"repeated", general:"worse"}), P, "red");
check("температура 40.2 с перегревом", A({temp:40.2, overheat:true}), P, "red");
check("красный перекрывает жёлтый", A({gums:"pale", breathing:"heavy", limp:3, limpPaw:"bl"}), P, "red");

/* ── нейтральный: данных не хватает ── */
check("не проверены моча и дёсны", A({urine:"unknown", gums:"unknown"}), P, "neutral");
check("не проверены дёсны и дыхание", A({gums:"unknown", breathing:"unknown"}), P, "neutral");
check("неполная + красный признак → красный", A({urine:"unknown", gums:"unknown", collapse:"faint"}), P, "red");
check("неполная + жёлтый признак → жёлтый", A({urine:"unknown", breathing:"unknown", general:"worse"}), P, "yellow");

console.log("");
console.log(fail ? (fail + " провал(ов)") : "все сценарии прошли");
process.exit(fail ? 1 : 0);
