26-01.html ���� ������ �������
02-01.js ��������� � � �������� ������ localhost:3000/26-02.html
03-01.js ������ ��������� � ������ localhost:3000/


2) ����� emcc
	git clone https://github.com/emscripten-core/emsdk.git
	(����� ����� ������ �����)
	=> ���� ����� emsdk, ������ � ���
	git pool
	
* �������� ��� �� �
  	������ �-��: $emcc -03 -o p.wasm WASM=1 p.c
	=> �������� p.wasm
	26-02.html - ����. wasm ��� � ������
	02-01.js - �� ������� ����� ����������

3) ������ js-����, ���. � ������ wasm (�����)
	�� get ����� �-�


int sum(int x, int y) {return x+y;}

int sub(int x, int y) {return x-y;}

int div(int x, int y) {return x/y;}

int mul(int x, int y) {return x*y;}