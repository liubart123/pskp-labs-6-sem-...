26-01.html надо просто открыть
02-01.js запустить и в браузере ввести localhost:3000/26-02.html
03-01.js просто запустить и ввести localhost:3000/


2) устан emcc
	git clone https://github.com/emscripten-core/emsdk.git
	(получ копию нашего репоз)
	=> появ папка emsdk, зайдем в нее
	git pool
	
* написать код на С
  	дальше к-да: $emcc -03 -o p.wasm WASM=1 p.c
	=> появился p.wasm
	26-02.html - счит. wasm код и исполн
	02-01.js - по запросу будет выдаваться

3) разраб js-прил, раб. с файлом wasm (асинх)
	по get вызыв ф-и


int sum(int x, int y) {return x+y;}

int sub(int x, int y) {return x-y;}

int div(int x, int y) {return x/y;}

int mul(int x, int y) {return x*y;}