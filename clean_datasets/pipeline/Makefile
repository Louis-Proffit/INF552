EXEC = region departement circonscription canton commune

all: $(EXEC:=.do)

clean: $(EXEC:=.clean)

%.do:
	@ cd $* && $(MAKE) all

%.clean:
	cd $* && $(MAKE) clean

