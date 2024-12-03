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

    @Value("${tes.db.host}")
    private String host;

    @Value("${tes.db.port}")
    private String port;

    @Value("${tes.db.name}")
    private String dbName;

    @Value("${tes.db.username}")
    private String username;

    @Value("${tes.db.password}")
    private String password;

    @Value("${tes.db.driver}")
    private String driver;

    @Value("${tes.db.url.protocol}")
    private String protocol;

    @Value("${tes.conn.pool.init}")
    private int initialPoolSize;

    @Value("${tes.conn.pool.min}")
    private int minPoolSize;

    @Value("${tes.conn.pool.max}")
    private int maxPoolSize;

    @Value("${tes.datasource.jndi.name:@null}")
    private String dataSourceJndiName;

    @Value("${tes.conn.checkoutTimeout:10000}")
    private int checkoutTimeout;

    @Value("${tes.conn.unreturnedConnectionTimeout:10}")
    private int unreturnedConnectionTimeout;
}
