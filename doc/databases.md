<img src=".dbrelation.jpg" width="50%">

# organization
```sql
    CREATE TABLE organization (
        id MEDIUMINT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        included_tables TEXT NOT NULL,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        isdeleted MEDIUMINT NOT NULL DEFAULT 0,
        PRIMARY KEY (id),
        UNIQUE KEY name (name, isdeleted)
    ) CHARACTER SET = utf8;
    INSERT INTO organization (name, included_tables) VALUES ('bivrost', '*');
```

# role
```sql
    CREATE TABLE role (
        id MEDIUMINT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        privilege VARCHAR(255) NOT NULL DEFAULT "",
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY (name)
    ) CHARACTER SET = utf8;
```

# department
```sql
    CREATE TABLE department (
        id MEDIUMINT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        privilege VARCHAR(255) NOT NULL DEFAULT "",
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY (name)
    ) CHARACTER SET = utf8;
```

# user
```sql
    CREATE TABLE user (
        id MEDIUMINT NOT NULL AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        organization_id MEDIUMINT NOT NULL,
        nickname VARCHAR(255),
        phone VARCHAR(255),
        gender VARCHAR(255),
        privilege VARCHAR(255),
        department_id MEDIUMINT,
        role_id MEDIUMINT,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        isdeleted MEDIUMINT NOT NULL DEFAULT 0,
        PRIMARY KEY (id),
        UNIQUE KEY email (email, isdeleted),
        FOREIGN KEY (organization_id) REFERENCES organization(id), 
        FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE SET NULL,
        FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE SET NULL
    ) CHARACTER SET = utf8;
```

# recentrequest
```sql
    CREATE TABLE recentrequest (
        id MEDIUMINT NOT NULL AUTO_INCREMENT,
        user_id MEDIUMINT NOT NULL,
        request VARCHAR(255) NOT NULL,
        module VARCHAR(255),
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (user_id) REFERENCES user(id)
    ) CHARACTER SET = utf8;
```

# productgroup
```sql
    CREATE TABLE productgroup (
        id MEDIUMINT NOT NULL AUTO_INCREMENT,
        code VARCHAR(255),
        name VARCHAR(255) NOT NULL,
        note TEXT,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        isdeleted MEDIUMINT NOT NULL DEFAULT 0,
        PRIMARY KEY (id),
        UNIQUE KEY name (name, isdeleted)
    ) CHARACTER SET = utf8;
```

# product
```sql
    CREATE TABLE product (
        id MEDIUMINT NOT NULL AUTO_INCREMENT,
        code VARCHAR(255),
        productgroup_id MEDIUMINT,
        name VARCHAR(255) NOT NULL,
        price INT,
        note TEXT,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        isdeleted MEDIUMINT NOT NULL DEFAULT 0,
        PRIMARY KEY (id),
        UNIQUE KEY name (name, isdeleted),
        FOREIGN KEY (productgroup_id) REFERENCES productgroup(id) ON DELETE SET NULL
    ) CHARACTER SET = utf8;
```

# productionplan
```sql
    CREATE TABLE productionplan (
        id MEDIUMINT NOT NULL AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        begin DATE NOT NULL,
        end DATE NOT NULL,
        assignee_id MEDIUMINT NOT NULL,
        status VARCHAR(255) NOT NULL,
        product_id MEDIUMINT,
        quantity INT,
        note TEXT,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        isdeleted MEDIUMINT NOT NULL DEFAULT 0,
        PRIMARY KEY (id),
        FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE SET NULL,
        FOREIGN KEY (assignee_id) REFERENCES user(id)
    ) CHARACTER SET = utf8;
```

# chartdata
```sql
    CREATE TABLE chartdata (
        id MEDIUMINT NOT NULL AUTO_INCREMENT,
        user_id MEDIUMINT NOT NULL,
        data TEXT NOT NULL,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id), 
        FOREIGN KEY (user_id) REFERENCES user(id) 
    ) CHARACTER SET = utf8;
```