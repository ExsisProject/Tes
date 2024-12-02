package com.daou.go.common.properties;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

@Configuration
@ComponentScan(basePackages = "com.daou.go.common.properties")
@PropertySource("classpath:META-INF/datasource-tes.properties")
@Getter
public class TesDBProperties extends GoProperties{

    @Value("${erp.db.host}")
    private String host;

    @Value("${erp.db.port}")
    private String port;

    @Value("${erp.db.name}")
    private String dbName;

    @Value("${erp.db.username}")
    private String username;

    @Value("${erp.db.password}")
    private String password;

    @Value("${erp.db.driver}")
    private String driver;

    @Value("${erp.db.url.protocol}")
    private String protocol;

    @Value("${erp.conn.pool.init}")
    private int initialPoolSize;

    @Value("${erp.conn.pool.min}")
    private int minPoolSize;

    @Value("${erp.conn.pool.max}")
    private int maxPoolSize;

    @Value("${erp.datasource.jndi.name:@null}")
    private String dataSourceJndiName;

    @Value("${erp.conn.checkoutTimeout:10000}")
    private int checkoutTimeout;

    @Value("${erp.conn.unreturnedConnectionTimeout:10}")
    private int unreturnedConnectionTimeout;
}
