package com.selab.springbootblueprints.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.selab.springbootblueprints.util.ValidationPattern;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "User")
@Getter
@Setter
@NamedEntityGraphs({
        @NamedEntityGraph(name = "joinUserGroup", attributeNodes = {
                @NamedAttributeNode("userGroup")
        }),
        @NamedEntityGraph(name = "joinUserAuth",
                attributeNodes = {
                        @NamedAttributeNode(value = "userGroup", subgraph = "joinUserAuth.userGroupAuthList")
                },
                subgraphs = {
                        @NamedSubgraph(name = "joinUserAuth.userGroupAuthList", attributeNodes = {
                                @NamedAttributeNode("userGroupAuthList")
                        })
                }
        )
})
public class User {

    @Id
    @Column(name = "Id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "Username", unique = true)
    private String username;

    @Column(name = "Password")
    private String password;

    @Column(name = "Enabled")
    private Boolean enabled;

    @Column(name = "AccountNonExpired")
    private Boolean accountNonExpired;

    @Column(name = "AccountNonLocked")
    private Boolean accountNonLocked;

    @Column(name = "CredentialsNonExpired")
    private Boolean credentialsNonExpired;

    @ManyToOne
    @JoinColumn(name = "UserGroupId")
    @ToString.Exclude
    private UserGroup userGroup;

    @Column(name = "RegisterDate")
    @CreationTimestamp
    @DateTimeFormat(iso = ISO.DATE_TIME)
    private LocalDateTime registerDate;

    @Transient
    @JsonIgnore
    private static final int MAX_NAME_LENGTH = 15;

    @Transient
    @JsonIgnore
    private static final int MIN_NAME_LENGTH = 5;

    @Transient
    @JsonIgnore
    private static final int MAX_PASSWORD_LENGTH = 21;

    @Transient
    @JsonIgnore
    private static final int MIN_PASSWORD_LENGTH = 5;

    public User(String username, String password, UserGroup group) {
        this.username = username;
        this.password = password;
        this.userGroup = group;
        this.enabled = Boolean.TRUE;
        this.accountNonExpired = Boolean.TRUE;
        this.accountNonLocked = Boolean.TRUE;
        this.credentialsNonExpired = Boolean.TRUE;
    }

    public User() {

    }

    @Transient
    public boolean isValid() {

        return isValidName(this.username) &&
                isValidPassword(this.password);
    }

    @Transient
    public static boolean isValidName(String name) {
        int nameLength = name.length();

        return nameLength >= MIN_NAME_LENGTH &&
                nameLength <= MAX_NAME_LENGTH &&
                ValidationPattern.NON_WORLD_CHARACTER.matcher(name).matches();
    }

    @Transient
    public static boolean isValidPassword(String password) {
        int passwordLength = password.length();

        return passwordLength >= MIN_PASSWORD_LENGTH &&
                passwordLength <= MAX_PASSWORD_LENGTH;
    }
}