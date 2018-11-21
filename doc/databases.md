# productionplan
```sql
    CREATE TABLE productionplan (
        id MEDIUMINT NOT NULL AUTO_INCREMENT,
        code VARCHAR(255),
        quantity INT NOT NULL,
        begin DATE NOT NULL,
        end DATE NOT NULL,
        assignee VARCHAR(32) NOT NULL,
        status VARCHAR(32) NOT NULL,
        note TEXT,
        PRIMARY KEY (id),
        UNIQUE (code)
    ) CHARACTER SET = utf8;
```
# products
```sql
    CREATE TABLE products (
        id MEDIUMINT NOT NULL AUTO_INCREMENT,
        code VARCHAR(255),
        productgroup VARCHAR(255),
        name VARCHAR(255),
        PRIMARY KEY (id),
        UNIQUE (code),
        UNIQUE (name)
    ) CHARACTER SET = utf8;
```

# productgroup
```sql
    CREATE TABLE productgroup (
        id MEDIUMINT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255),
        PRIMARY KEY (id),
        UNIQUE (name)
    ) CHARACTER SET = utf8;
```